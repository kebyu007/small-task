import { BaseException } from "./base.exception.js";

export class ContractClosedException extends BaseException {
  constructor(message) {
    super(message);
    this.status = 409;
    this.name = "Conflict Exception";
    this.code = "CONTRACT_CLOSED";
  }
}
