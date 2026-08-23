import express from "express";
import {
  getMyTickets, createTicket, getTicket, getFAQs,
} from "../../controllers/student/supportController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/tickets", getMyTickets);
router.post("/tickets", createTicket);
router.get("/tickets/:id", getTicket);
router.get("/faqs", getFAQs);

export default router;