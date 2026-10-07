import pool from "../configs/db.config.js";
import { connectRabbitMQ, sendToQueue } from "../configs/rabbitmq.config.js";

const run = async () => {
  try {
    await connectRabbitMQ();
    
    const result = await pool.query(`
      SELECT s.id, s.amount, s.paid_amount, c.customer_id
      FROM schedule_items s
      JOIN contracts c ON s.contract_id = c.id
      WHERE s.status != 'paid' 
        AND c.status = 'active'
        AND s.due_date = CURRENT_DATE + INTERVAL '3 days'
    `);

    let count = 0;
    for (const row of result.rows) {
      const remaining_amount = parseInt(row.amount, 10) - parseInt(row.paid_amount, 10);
      if (remaining_amount > 0) {
        sendToQueue("notifications", {
          type: "payment.reminder",
          customer_id: row.customer_id,
          amount: remaining_amount
        });
        count++;
      }
    }

    console.log(`[Remind Script] Jami ${count} ta eslatma RabbitMQ ga yuborildi.`);
  } catch (err) {
    console.error("Xatolik:", err);
  } finally {
    setTimeout(() => {
      pool.end();
      process.exit(0);
    }, 1500);
  }
};

run();
