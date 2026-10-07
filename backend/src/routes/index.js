import { Router } from "express";
import customerRouter from "./customer.route.js";
import productRouter from "./product.route.js";
import tariffRouter from "./tariff.route.js";
import contractRouter from "./contract.route.js";
import reportRouter from "./report.route.js";

const apiRouter = Router();

apiRouter.use(customerRouter);
apiRouter.use(productRouter);
apiRouter.use(tariffRouter);
apiRouter.use(contractRouter);
apiRouter.use(reportRouter);

export default apiRouter;
