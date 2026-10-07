import pool from "../configs/db.config.js";

class ReportController {
  async getOverdue(req, res, next) {
    try {
      const query = `
        SELECT 
          s.id AS schedule_id,
          s.due_date,
          s.amount,
          s.paid_amount,
          (s.amount - s.paid_amount) AS debt_amount,
          c.id AS contract_id,
          cu.id AS customer_id,
          cu.first_name,
          cu.last_name,
          cu.phone
        FROM schedule_items s
        JOIN contracts c ON s.contract_id = c.id
        JOIN customers cu ON c.customer_id = cu.id
        WHERE s.status != 'paid' 
          AND c.status = 'active'
          AND s.due_date < CURRENT_DATE
        ORDER BY s.due_date ASC
      `;
      
      const result = await pool.query(query);

      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new ReportController();
