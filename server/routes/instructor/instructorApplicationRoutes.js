import express from "express";

import {
  submitInstructorApplication,
  getMyInstructorApplication,
  getInstructorApplication,
  updateInstructorApplication,
  withdrawInstructorApplication,
} from "../../controllers/instructor/instructorApplicationController.js";

import authenticate from "../../middlewares/auth/authenticate.js";
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
  authenticate,
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
  authenticate,
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
  authenticate,
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
  authenticate,
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
  authenticate,
  withdrawInstructorApplication
);


export default router;
