import express from "express";

import {
  getInstructorCategories,
} from "../../controllers/instructor/categoryController.js";

import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();

router.use(authenticate, isInstructor);

router.get("/", getInstructorCategories);

export default router;