import app from "./app.js";
import { connectRedis } from "./configs/redis.config.js";
import { connectRabbitMQ } from "./configs/rabbitmq.config.js";
import dotenv from "dotenv";

dotenv.config({ quiet: true });
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectRedis();
    await connectRabbitMQ();

    app.listen(PORT, () => {
      console.log(`Server is on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Internal server error:", error);
  }
};

startServer();
