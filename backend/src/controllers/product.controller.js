import pool from "../configs/db.config.js";
import { createProductSchema, queryProductSchema } from "../schemas/product.schema.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";

class ProductController {
  async create(req, res, next) {
    try {
      const { error, value } = createProductSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.details[0].message);
      }

      const { name, price, stock_qty } = value;

      const { rows } = await pool.query(
        "INSERT INTO products (name, price, stock_qty) VALUES ($1, $2, $3) RETURNING *",
        [name, price, stock_qty]
      );

      res.status(201).json({
        success: true,
        data: rows[0],
      });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const { error, value } = queryProductSchema.validate(req.query);
      if (error) {
        throw new BadRequestException(error.details[0].message);
      }

      const { search, page, limit } = value;
      const offset = (page - 1) * limit;

      let query = "SELECT * FROM products";
      let countQuery = "SELECT COUNT(*) FROM products";
      const params = [];
      const countParams = [];

      if (search) {
        query += " WHERE name ILIKE $1";
        countQuery += " WHERE name ILIKE $1";
        params.push(`%${search}%`);
        countParams.push(`%${search}%`);
      }

      query += ` ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const [productsResult, countResult] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery, countParams),
      ]);

      const total = parseInt(countResult.rows[0].count, 10);

      res.json({
        success: true,
        data: productsResult.rows,
        meta: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new ProductController();
