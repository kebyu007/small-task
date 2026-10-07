import amqplib from "amqplib";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

let channel = null;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect(
      process.env.RABBITMQ_URL || "amqp://localhost",
    );
    channel = await connection.createChannel();

    await channel.assertQueue("notifications", { durable: true });

    console.log("RabbitMQ serveriga ulandi!");
  } catch (error) {
    console.error("RabbitMQ ulanishda xatolik:", error.message);
  }
};

export const sendToQueue = (queueName, data) => {
  if (!channel) {
    console.error("RabbitMQ kanal mavjud emas. Xabar jo'natilmadi.");
    return;
  }
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
    persistent: true,
  });
};
