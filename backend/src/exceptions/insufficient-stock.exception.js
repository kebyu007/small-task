import { BaseException } from "./base.exception.js";

export class InsufficientStockException extends BaseException {
  constructor(message) {
    super(message);
    this.status = 409;
    this.name = "Conflict Exception";
    this.code = "INSUFFICIENT_STOCK";
  }
}
