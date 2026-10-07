import amqplib from "amqplib";
import dotenv from "dotenv";
import pool from "./configs/db.config.js";

dotenv.config({ quiet: true });

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE_NAME = "notifications";

const startWorker = async () => {
  try {
    const connection = await amqplib.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    channel.prefetch(1);
    
    console.log("Worker ishga tushdi. Xabarlarni kutmoqda...");

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          
          const customerResult = await pool.query("SELECT first_name, last_name FROM customers WHERE id = $1", [data.customer_id]);
          const customer = customerResult.rows[0];
          
          let title = "";
          let message = "";

          if (data.type === "payment.received") {
            title = "To'lov qabul qilindi";
            message = `Hurmatli ${customer.first_name} ${customer.last_name}, ${data.amount} so'm to'lovingiz qabul qilindi. Qolgan qarz: ${data.remaining_debt} so'm.`;
          } else if (data.type === "contract.created") {
            title = "Shartnoma tuzildi";
            message = `Tabriklaymiz, ${customer.first_name}! Shartnoma muvaffaqiyatli ochildi (Jami qarz: ${data.financed_amount} so'm). Birinchi to'lov sanasi: ${data.first_payment_date}.`;
          } else if (data.type === "contract.closed") {
            title = "Shartnoma yopildi";
            message = `Hurmatli ${customer.first_name}, sizning barcha qarzlaringiz to'liq yopildi. Xaridingiz uchun rahmat!`;
          } else if (data.type === "payment.reminder") {
            title = "To'lov eslatmasi";
            message = `Hurmatli ${customer.first_name} ${customer.last_name}, sizning 3 kundan so'ng ${data.amount} so'm to'lovingiz bor. Iltimos, o'z vaqtida to'lovni amalga oshirishni unutmang.`;
          }

          if (title && message) {
            await pool.query(
              "INSERT INTO notifications (customer_id, title, message) VALUES ($1, $2, $3)",
              [data.customer_id, title, message]
            );
            console.log(`✅ [Worker] Bildirishnoma yozildi: ${data.type} (Mijoz ID: ${data.customer_id})`);
          }

          channel.ack(msg);
        } catch (err) {
          console.error("❌ [Worker] Xatoni qayta ishlashda xatolik:", err);
          channel.nack(msg);
        }
      }
    }, {
      noAck: false
    });

  } catch (error) {
    console.error("Worker ulanishda xato qildi:", error);
  }
};

startWorker();
