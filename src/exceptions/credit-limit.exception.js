import { BaseException } from "./base.exception.js";

export class CreditLimitExceededException extends BaseException {
  constructor(message, details) {
    super(message);
    this.status = 422;
    this.name = "CREDIT LIMIT EXCEEDED Exception";
    this.code = "CREDIT_LIMIT_EXCEEDED";
    this.details = details;
  }
}
