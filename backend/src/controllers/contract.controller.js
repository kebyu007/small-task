import pool from "../configs/db.config.js";
import { sendToQueue } from "../configs/rabbitmq.config.js";
import { calculateSchema, createContractSchema, paymentSchema } from "../schemas/contract.schema.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { generateSchedule } from "../utils/schedule.util.js";

class ContractController {
  
  async calculate(req, res, next) {
    try {
      const { error, value } = calculateSchema.validate(req.body);
      if (error) throw new BadRequestException(error.details[0].message);

      const { customer_id, items, months, down_payment } = value;

      const customerResult = await pool.query("SELECT * FROM customers WHERE id = $1", [customer_id]);
      if (customerResult.rows.length === 0) {
        throw new NotFoundException("Mijoz topilmadi");
      }
      const customer = customerResult.rows[0];

      const tariffResult = await pool.query("SELECT markup_percent FROM tariffs WHERE months = $1", [months]);
      if (tariffResult.rows.length === 0) {
        throw new BadRequestException("Tanlangan muddat uchun tarif topilmadi");
      }
      const markup_percent = parseInt(tariffResult.rows[0].markup_percent, 10);

      const productIds = items.map(i => i.product_id);
      const productsResult = await pool.query("SELECT id, price FROM products WHERE id = ANY($1)", [productIds]);
      
      let total_price = 0;
      for (const item of items) {
        const product = productsResult.rows.find(p => p.id === item.product_id);
        if (!product) throw new NotFoundException(`ID ${item.product_id} tovar topilmadi`);
        total_price += parseInt(product.price, 10) * item.qty;
      }

      if (down_payment >= total_price) {
        throw new BadRequestException("Boshlang'ich to'lov jami summadan kichik bo'lishi kerak");
      }

      const qolgan_summa = total_price - down_payment;
      const markup_amount = Math.floor(qolgan_summa * (markup_percent / 100));
      const financed_amount = qolgan_summa + markup_amount;

      const debtResult = await pool.query(`
        SELECT COALESCE(SUM(s.amount - s.paid_amount), 0) AS current_debt
        FROM schedule_items s
        JOIN contracts c ON s.contract_id = c.id
        WHERE c.customer_id = $1 AND c.status = 'active' AND s.status != 'paid'
      `, [customer_id]);
      const current_debt = parseInt(debtResult.rows[0].current_debt, 10);
      
      if (current_debt + financed_amount > customer.credit_limit) {
        throw new BadRequestException("Ushbu xaridni amalga oshirish uchun mijozning bo'sh limiti yetarli emas");
      }

      const schedule = generateSchedule(financed_amount, months);

      res.json({
        success: true,
        data: {
          total_price,
          down_payment,
          markup_percent,
          markup_amount,
          financed_amount,
          schedule
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    const client = await pool.connect();
    try {
      const { error, value } = createContractSchema.validate(req.body);
      if (error) throw new BadRequestException(error.details[0].message);

      const { customer_id, items, months, down_payment } = value;

      await client.query('BEGIN');

      const customerResult = await client.query("SELECT * FROM customers WHERE id = $1 FOR UPDATE", [customer_id]);
      if (customerResult.rows.length === 0) throw new NotFoundException("Mijoz topilmadi");
      const customer = customerResult.rows[0];

      const tariffResult = await client.query("SELECT markup_percent FROM tariffs WHERE months = $1", [months]);
      if (tariffResult.rows.length === 0) throw new BadRequestException("Tarif topilmadi");
      const markup_percent = parseInt(tariffResult.rows[0].markup_percent, 10);

      const productIds = items.map(i => i.product_id);
      const productsResult = await client.query("SELECT id, name, price, stock_qty FROM products WHERE id = ANY($1) FOR UPDATE", [productIds]);
      
      let total_price = 0;
      for (const item of items) {
        const product = productsResult.rows.find(p => p.id === item.product_id);
        if (!product) throw new NotFoundException(`ID ${item.product_id} tovar topilmadi`);
        if (product.stock_qty < item.qty) {
          throw new BadRequestException(`"${product.name}" omborda yetarli emas (qoldiq: ${product.stock_qty})`);
        }
        total_price += parseInt(product.price, 10) * item.qty;
      }

      if (down_payment >= total_price) {
        throw new BadRequestException("Boshlang'ich to'lov jami summadan kichik bo'lishi kerak");
      }

      const qolgan_summa = total_price - down_payment;
      const markup_amount = Math.floor(qolgan_summa * (markup_percent / 100));
      const financed_amount = qolgan_summa + markup_amount;

      const debtResult = await client.query(`
        SELECT COALESCE(SUM(s.amount - s.paid_amount), 0) AS current_debt
        FROM schedule_items s
        JOIN contracts c ON s.contract_id = c.id
        WHERE c.customer_id = $1 AND c.status = 'active' AND s.status != 'paid'
      `, [customer_id]);
      const current_debt = parseInt(debtResult.rows[0].current_debt, 10);
      
      if (current_debt + financed_amount > customer.credit_limit) {
        throw new BadRequestException("Mijozning bo'sh limiti yetarli emas");
      }

      for (const item of items) {
        await client.query("UPDATE products SET stock_qty = stock_qty - $1 WHERE id = $2", [item.qty, item.product_id]);
      }

      const contractResult = await client.query(
        `INSERT INTO contracts (customer_id, status, total_price, down_payment, markup_amount, financed_amount, months) 
         VALUES ($1, 'active', $2, $3, $4, $5, $6) RETURNING *`,
        [customer_id, total_price, down_payment, markup_amount, financed_amount, months]
      );
      const contract = contractResult.rows[0];

      for (const item of items) {
        const product = productsResult.rows.find(p => p.id === item.product_id);
        await client.query(
          "INSERT INTO contract_items (contract_id, product_id, qty, unit_price) VALUES ($1, $2, $3, $4)",
          [contract.id, item.product_id, item.qty, product.price]
        );
      }

      const schedule = generateSchedule(financed_amount, months);
      for (const sch of schedule) {
        await client.query(
          "INSERT INTO schedule_items (contract_id, seq_no, due_date, amount, paid_amount, status) VALUES ($1, $2, $3, $4, 0, 'pending')",
          [contract.id, sch.seq_no, sch.due_date, sch.amount]
        );
      }

      await client.query('COMMIT');
      
      // Xabarni quyonchaga tashlash
      sendToQueue("notifications", {
        type: "contract.created",
        customer_id: contract.customer_id,
        contract_id: contract.id,
        financed_amount: contract.financed_amount,
        first_payment_date: schedule[0].due_date
      });

      res.status(201).json({
        success: true,
        data: contract
      });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }

  async getAll(req, res, next) {
    try {
      const { rows } = await pool.query(`
        SELECT 
          c.*, 
          cu.full_name as customer_name, 
          cu.phone as customer_phone,
          COALESCE((SELECT SUM(paid_amount) FROM schedule_items WHERE contract_id = c.id), 0) AS total_paid,
          (c.financed_amount - COALESCE((SELECT SUM(paid_amount) FROM schedule_items WHERE contract_id = c.id), 0)) AS remaining_debt,
          (SELECT due_date FROM schedule_items WHERE contract_id = c.id AND status != 'paid' ORDER BY seq_no ASC LIMIT 1) AS next_payment_date,
          (SELECT (amount - paid_amount) FROM schedule_items WHERE contract_id = c.id AND status != 'paid' ORDER BY seq_no ASC LIMIT 1) AS next_payment_amount
        FROM contracts c
        JOIN customers cu ON c.customer_id = cu.id
        ORDER BY c.created_at DESC
      `);
      res.json({
        success: true,
        data: rows
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const contractResult = await pool.query("SELECT * FROM contracts WHERE id = $1", [id]);
      if (contractResult.rows.length === 0) throw new NotFoundException("Shartnoma topilmadi");
      
      const itemsResult = await pool.query("SELECT * FROM contract_items WHERE contract_id = $1", [id]);
      const scheduleResult = await pool.query("SELECT * FROM schedule_items WHERE contract_id = $1 ORDER BY seq_no ASC", [id]);

      res.json({
        success: true,
        data: {
          ...contractResult.rows[0],
          items: itemsResult.rows,
          schedule: scheduleResult.rows
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async pay(req, res, next) {
    const client = await pool.connect();
    try {
      const { id: contract_id } = req.params;
      const { error, value } = paymentSchema.validate(req.body);
      if (error) throw new BadRequestException(error.details[0].message);

      const { amount, idempotency_key } = value;

      await client.query('BEGIN');

      const existingPayment = await client.query("SELECT * FROM payments WHERE idempotency_key = $1", [idempotency_key]);
      if (existingPayment.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.json({ 
          success: true, 
          message: "Ushbu to'lov allaqachon amalga oshirilgan", 
          data: existingPayment.rows[0] 
        });
      }

      const contractResult = await client.query("SELECT * FROM contracts WHERE id = $1 AND status = 'active' FOR UPDATE", [contract_id]);
      if (contractResult.rows.length === 0) throw new BadRequestException("Faol shartnoma topilmadi");

      const scheduleResult = await client.query(
        "SELECT * FROM schedule_items WHERE contract_id = $1 AND status != 'paid' ORDER BY seq_no ASC FOR UPDATE", 
        [contract_id]
      );
      
      let remainingToPay = amount;
      
      for (const item of scheduleResult.rows) {
        if (remainingToPay <= 0) break;
        
        const qarz = parseInt(item.amount, 10) - parseInt(item.paid_amount, 10);
        const tolov = Math.min(qarz, remainingToPay);
        
        const newPaidAmount = parseInt(item.paid_amount, 10) + tolov;
        const newStatus = newPaidAmount === parseInt(item.amount, 10) ? 'paid' : 'partial';
        
        await client.query(
          "UPDATE schedule_items SET paid_amount = $1, status = $2 WHERE id = $3",
          [newPaidAmount, newStatus, item.id]
        );
        
        remainingToPay -= tolov;
      }

      if (remainingToPay > 0) {
        throw new BadRequestException(`Kiritilgan summa ortiqcha. Qarz miqdori: ${amount - remainingToPay}`);
      }

      const paymentResult = await client.query(
        "INSERT INTO payments (contract_id, amount, idempotency_key) VALUES ($1, $2, $3) RETURNING *",
        [contract_id, amount, idempotency_key]
      );

      const unFinished = await client.query("SELECT id FROM schedule_items WHERE contract_id = $1 AND status != 'paid'", [contract_id]);
      if (unFinished.rows.length === 0) {
        await client.query("UPDATE contracts SET status = 'closed' WHERE id = $1", [contract_id]);
      }

      await client.query('COMMIT');
      
      // Muvaffaqiyatli to'lov xabarini jo'natish
      const initial_debt = scheduleResult.rows.reduce((sum, item) => sum + (parseInt(item.amount, 10) - parseInt(item.paid_amount, 10)), 0);
      sendToQueue("notifications", {
        type: "payment.received",
        customer_id: contractResult.rows[0].customer_id,
        amount: amount,
        remaining_debt: initial_debt - amount
      });

      // Agar yopilgan bo'lsa uni ham aytish
      if (unFinished.rows.length === 0) {
        sendToQueue("notifications", {
          type: "contract.closed",
          customer_id: contractResult.rows[0].customer_id,
          contract_id: contract_id
        });
      }

      res.json({ success: true, data: paymentResult.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
}

export default new ContractController();
