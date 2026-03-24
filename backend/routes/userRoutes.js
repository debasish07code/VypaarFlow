import express from "express";
import { registerUser, loginUser, getUserProfile, changePassword } from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/change-password", authMiddleware, changePassword);

// 🔒 TEST PROTECTED ROUTE
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route working",
    userId: req.user,
  });
});

export default router;