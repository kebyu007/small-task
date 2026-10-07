import { Router } from "express";
import ContractController from "../controllers/contract.controller.js";

const contractRouter = Router();

contractRouter.post("/contracts/calculate", ContractController.calculate);
contractRouter.post("/contracts", ContractController.create);
contractRouter.get("/contracts/:id", ContractController.getById);
contractRouter.post("/contracts/:id/payments", ContractController.pay);

export default contractRouter;
