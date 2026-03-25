import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import compression from "compression";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json());

// MongoDB connection with pooling
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));
  
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/transactions", transactionRoutes);

// test route
app.get("/", (req, res) => {
  res.send("VypaarFlow API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});