import { Router } from "express";
import ReportController from "../controllers/report.controller.js";

const reportRouter = Router();

reportRouter.get("/reports/overdue", ReportController.getOverdue);

export default reportRouter;
