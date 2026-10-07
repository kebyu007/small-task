import pool from "../configs/db.config.js";
import { createCustomerSchema } from "../schemas/customer.schema.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";

class CustomerController {
  async create(req, res, next) {
    try {
      const { error, value } = createCustomerSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.details[0].message);
      }

      const { full_name, phone, credit_limit } = value;

      const { rows } = await pool.query(
        "INSERT INTO customers (full_name, phone, credit_limit) VALUES ($1, $2, $3) RETURNING *",
        [full_name, phone, credit_limit]
      );

      res.status(201).json({
        success: true,
        data: rows[0],
      });
    } catch (err) {
      if (err.code === "23505") {
        next(new BadRequestException("Ushbu telefon raqami allaqachon ro'yxatdan o'tgan"));
      } else {
        next(err);
      }
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const customerResult = await pool.query("SELECT * FROM customers WHERE id = $1", [id]);
      if (customerResult.rows.length === 0) {
        throw new NotFoundException("Mijoz topilmadi");
      }

      const customer = customerResult.rows[0];

      const debtResult = await pool.query(`
        SELECT COALESCE(SUM(s.amount - s.paid_amount), 0) AS current_debt
        FROM schedule_items s
        JOIN contracts c ON s.contract_id = c.id
        WHERE c.customer_id = $1 AND c.status = 'active' AND s.status != 'paid'
      `, [id]);

      const current_debt = parseInt(debtResult.rows[0].current_debt, 10);
      const free_limit = parseInt(customer.credit_limit, 10) - current_debt;

      res.json({
        success: true,
        data: {
          ...customer,
          current_debt,
          free_limit: free_limit > 0 ? free_limit : 0,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getNotifications(req, res, next) {
    try {
      const { id } = req.params;

      const customerResult = await pool.query("SELECT id FROM customers WHERE id = $1", [id]);
      if (customerResult.rows.length === 0) {
        throw new NotFoundException("Mijoz topilmadi");
      }

      const { rows: notifications } = await pool.query(
        "SELECT * FROM notifications WHERE customer_id = $1 ORDER BY created_at DESC",
        [id]
      );

      res.json({
        success: true,
        data: notifications,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new CustomerController();
