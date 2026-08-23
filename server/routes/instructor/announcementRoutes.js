import express from "express";
import {
  getMyAnnouncements, createAnnouncement,
  updateAnnouncement, deleteAnnouncement,
} from "../../controllers/instructor/announcementController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/", getMyAnnouncements);
router.post("/", createAnnouncement);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);

export default router;