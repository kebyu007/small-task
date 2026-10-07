import { BaseException } from "./src/exceptions/base.exception.js";
import { BadRequestException } from "./src/exceptions/bad-request.exception.js";

const err = new BadRequestException("Test");
console.log("instanceof BaseException?", err instanceof BaseException);
