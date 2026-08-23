import express from "express";
import {
  getStudyGroups, joinStudyGroup, getEvents, rsvpEvent,
} from "../../controllers/student/communityController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/groups", getStudyGroups);
router.post("/groups/:id/join", joinStudyGroup);
router.get("/events", getEvents);
router.post("/events/:id/rsvp", rsvpEvent);

export default router;