import Worker from "../models/workerModel.js";

// GET /api/workers — list all workers owned by the authenticated user
export const getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({ user: req.user._id }).lean();
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/workers/:id — single worker with full attendance
export const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!worker) return res.status(404).json({ message: "Worker not found" });
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/workers — create a new worker
export const createWorker = async (req, res) => {
  try {
    const { name, position, base_salary, phone } = req.body;
    const worker = await Worker.create({ user: req.user._id, name, position, base_salary, phone });
    res.status(201).json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/workers/:id — update worker info
export const updateWorker = async (req, res) => {
  try {
    const worker = await Worker.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!worker) return res.status(404).json({ message: "Worker not found" });
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/workers/:id
export const deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!worker) return res.status(404).json({ message: "Worker not found" });
    res.json({ message: "Worker deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/workers/:id/attendance — mark attendance for today
export const markAttendance = async (req, res) => {
  try {
    const { status } = req.body; // "present" or "absent"
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const worker = await Worker.findOne({ _id: req.params.id, user: req.user._id });
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    // Remove existing entry for today if any (idempotent)
    worker.attendance = worker.attendance.filter(
      (a) => new Date(a.date).setHours(0,0,0,0) !== today.getTime()
    );
    worker.attendance.push({ date: today, status });
    await worker.save();

    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
