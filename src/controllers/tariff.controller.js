import pool from "../configs/db.config.js";
import { redisClient } from "../configs/redis.config.js";
import { updateTariffSchema } from "../schemas/tariff.schema.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";

class TariffController {
  async getAll(req, res, next) {
    try {
      try {
        if (redisClient.isOpen) {
          const cachedTariffs = await redisClient.get("tariffs");
          if (cachedTariffs) {
            return res.json({
              success: true,
              data: JSON.parse(cachedTariffs),
              source: "cache",
            });
          }
        }
      } catch (redisError) {
        console.error("Redis o'qishda xatolik:", redisError);
      }

      const { rows: tariffs } = await pool.query("SELECT * FROM tariffs ORDER BY months ASC");

      try {
        if (redisClient.isOpen) {
          const ttl = parseInt(process.env.REDIS_TTL, 10) || 3600;
          await redisClient.setEx("tariffs", ttl, JSON.stringify(tariffs));
        }
      } catch (redisError) {
        console.error("Redis yozishda xatolik:", redisError);
      }

      res.json({
        success: true,
        data: tariffs,
        source: "database",
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { error, value } = updateTariffSchema.validate({
        params: req.params,
        body: req.body,
      });

      if (error) {
        throw new BadRequestException(error.details[0].message);
      }

      const { months } = value.params;
      const { markup_percent } = value.body;

      const { rows } = await pool.query(
        "UPDATE tariffs SET markup_percent = $1 WHERE months = $2 RETURNING *",
        [markup_percent, months]
      );

      let tariff = rows[0];

      if (!tariff) {
        const insertResult = await pool.query(
          "INSERT INTO tariffs (months, markup_percent) VALUES ($1, $2) RETURNING *",
          [months, markup_percent]
        );
        tariff = insertResult.rows[0];
      }

      try {
        if (redisClient.isOpen) {
          await redisClient.del("tariffs");
        }
      } catch (redisError) {
        console.error("Redis o'chirishda xatolik:", redisError);
      }

      res.json({
        success: true,
        data: tariff,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new TariffController();
