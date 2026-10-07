import { BaseException } from "../exceptions/base.exception.js";

export const errorHandlerMiddleware = (err, req, res, next) => {
  if (err instanceof BaseException) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  console.log("Something went wrong:", err);
  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Serverda kutilmagan xatolik yuz berdi",
    },
  });
};
