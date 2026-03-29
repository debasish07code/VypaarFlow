import express from "express";
import {
  getWorkers, getWorkerById, createWorker,
  updateWorker, deleteWorker, markAttendance
} from "../controllers/workerController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getWorkers);
router.post("/", createWorker);
router.get("/:id", getWorkerById);
router.put("/:id", updateWorker);
router.delete("/:id", deleteWorker);
router.post("/:id/attendance", markAttendance);

export default router;
