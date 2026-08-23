import express from "express";
import {
  getCalendar, createReminder, deleteReminder,
} from "../../controllers/student/calendarController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", getCalendar);
router.post("/reminders", createReminder);
router.delete("/reminders/:id", deleteReminder);

export default router;