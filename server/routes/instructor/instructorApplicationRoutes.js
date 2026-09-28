import express from "express";

import {
  submitInstructorApplication,
  getMyInstructorApplication,
  getInstructorApplication,
  updateInstructorApplication,
  withdrawInstructorApplication,
} from "../../controllers/instructor/instructorApplicationController.js";

import protect from "../../middlewares/auth/protect.js";


// If your actual authentication middleware has
// a different filename/name, keep your existing
// middleware name here.


const router = express.Router();


// ============================================================
// INSTRUCTOR APPLICATION
// ============================================================

// Submit application
router.post(
  "/applications",
  protect,
  submitInstructorApplication
);


// Get my application
router.get(
  "/applications/me",
  protect,
  getMyInstructorApplication
);


// Get specific application
router.get(
  "/applications/:id",
  protect,
  getInstructorApplication
);


// Update application
router.put(
  "/applications/:id",
  protect,
  updateInstructorApplication
);


// Withdraw application
router.delete(
  "/applications/:id",
  protect,
  withdrawInstructorApplication
);


export default router;