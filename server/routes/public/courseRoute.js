import express from "express";

import {
  getAllCourses,
  getCourse,
} from "../../controllers/public/courseController.js";

const router = express.Router();

// Public — anyone can view courses
router.get("/", getAllCourses);

// Public — anyone can view a single course
router.get("/:id", getCourse);

export default router;
