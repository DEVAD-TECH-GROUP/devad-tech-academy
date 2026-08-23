import express from "express";
import {
  getAllDiscussions, deleteDiscussion, pinDiscussion,
  getFlaggedContent, removeFlaggedContent,
  getStudyGroups, getCommunityEvents,
} from "../../controllers/superadmin/communityController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/discussions", getAllDiscussions);
router.delete("/discussions/:id", deleteDiscussion);
router.put("/discussions/:id/pin", pinDiscussion);
router.get("/flagged", getFlaggedContent);
router.put("/flagged/:id/remove", removeFlaggedContent);
router.get("/groups", getStudyGroups);
router.get("/events", getCommunityEvents);

export default router;