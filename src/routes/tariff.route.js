import { Router } from "express";
import TariffController from "../controllers/tariff.controller.js";

const tariffRouter = Router();

tariffRouter.get("/tariffs", TariffController.getAll);
tariffRouter.put("/tariffs/:months", TariffController.update);

export default tariffRouter;
