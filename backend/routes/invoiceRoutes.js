import express from "express";
import { generateInvoice, getInvoiceByOrder } from "../controllers/invoiceController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/generate", generateInvoice);
router.get("/:orderId", getInvoiceByOrder);

export default router;
