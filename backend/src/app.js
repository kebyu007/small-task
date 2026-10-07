import express from "express";
import cors from "cors";
import apiRouter from "./routes/index.js";
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware.js";

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

app.use((req, res, next) => {
  res
    .status(404)
    .json({ error: { code: "NOT_FOUND", message: "Bunday manzil topilmadi" } });
});

app.use(errorHandlerMiddleware);

export default app;
