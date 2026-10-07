import { Router } from "express";
import CustomerController from "../controllers/customer.controller.js";

const customerRouter = Router();

customerRouter.post("/customers", CustomerController.create);
customerRouter.get("/customers", CustomerController.getAll);
customerRouter.get("/customers/:id", CustomerController.getById);
customerRouter.get("/customers/:id/notifications", CustomerController.getNotifications);

export default customerRouter;
