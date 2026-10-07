import { Router } from "express";
import ProductController from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.post("/products", ProductController.create);
productRouter.get("/products", ProductController.getAll);

export default productRouter;
