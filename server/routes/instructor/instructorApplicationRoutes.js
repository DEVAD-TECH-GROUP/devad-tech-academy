import express from "express";

import {
  submitInstructorApplication,
  getMyInstructorApplication,
  getInstructorApplication,
  updateInstructorApplication,
  withdrawInstructorApplication,
} from "../../controllers/instructor/instructorApplicationController.js";

import protect from "../../middlewares/auth/protect.js";
import documentUpload from "../../middlewares/upload/documentUpload.js";

const router = express.Router();


/*
============================================================
INSTRUCTOR APPLICATION ROUTES
============================================================
*/


/*
------------------------------------------------------------
SUBMIT APPLICATION
------------------------------------------------------------

POST /api/instructor/applications
------------------------------------------------------------
*/
router.post(
  "/applications",
  protect,
  documentUpload.single("cv"),
  submitInstructorApplication
);


/*
------------------------------------------------------------
GET MY APPLICATION
------------------------------------------------------------

GET /api/instructor/applications/me
------------------------------------------------------------

IMPORTANT:
This must appear BEFORE /applications/:id
------------------------------------------------------------
*/
router.get(
  "/applications/me",
  protect,
  getMyInstructorApplication
);


/*
------------------------------------------------------------
GET SPECIFIC APPLICATION
------------------------------------------------------------

GET /api/instructor/applications/:id
------------------------------------------------------------
*/
router.get(
  "/applications/:id",
  protect,
  getInstructorApplication
);


/*
------------------------------------------------------------
UPDATE MY APPLICATION
------------------------------------------------------------

PUT /api/instructor/applications/:id
------------------------------------------------------------
*/
router.put(
  "/applications/:id",
  protect,
  documentUpload.single("cv"),
  updateInstructorApplication
);


/*
------------------------------------------------------------
WITHDRAW APPLICATION
------------------------------------------------------------

DELETE /api/instructor/applications/:id
------------------------------------------------------------
*/
router.delete(
  "/applications/:id",
  protect,
  withdrawInstructorApplication
);


export default router;
