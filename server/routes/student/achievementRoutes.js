import express from "express";
import {
  getMyAchievements, getMyBadges, getXPHistory,
  getStreaks, getLeaderboard,
} from "../../controllers/student/achievementController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", getMyAchievements);
router.get("/badges", getMyBadges);
router.get("/xp", getXPHistory);
router.get("/streaks", getStreaks);
router.get("/leaderboard", getLeaderboard);

export default router;