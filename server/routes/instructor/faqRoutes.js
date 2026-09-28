import express from "express";

import {
  getFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQs,
} from "../../controllers/instructor/faqController.js";

import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";

const router = express.Router();

// ============================================================
// INSTRUCTOR AUTHENTICATION
// ============================================================

router.use(
  authenticate,
  isInstructor
);

// ============================================================
// COURSE FAQs
// ============================================================

// GET /api/instructor/courses/:courseId/faqs
router.get(
  "/:courseId/faqs",
  getFAQs
);

// POST /api/instructor/courses/:courseId/faqs
router.post(
  "/:courseId/faqs",
  createFAQ
);

// ============================================================
// FAQ REORDER
// ============================================================

// PUT /api/instructor/courses/:courseId/faqs/reorder
router.put(
  "/:courseId/faqs/reorder",
  reorderFAQs
);

// ============================================================
// SINGLE FAQ
// ============================================================

// GET /api/instructor/courses/:courseId/faqs/:id
router.get(
  "/:courseId/faqs/:id",
  getFAQ
);

// PUT /api/instructor/courses/:courseId/faqs/:id
router.put(
  "/:courseId/faqs/:id",
  updateFAQ
);

// DELETE /api/instructor/courses/:courseId/faqs/:id
router.delete(
  "/:courseId/faqs/:id",
  deleteFAQ
);

export default router;
