import express from "express";
import {
  addProduct,
  getProducts,
  deleteProduct,
} from "../controllers/productController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addProduct);
router.get("/", authMiddleware, getProducts);
router.delete("/:id", authMiddleware, deleteProduct);

export default router;