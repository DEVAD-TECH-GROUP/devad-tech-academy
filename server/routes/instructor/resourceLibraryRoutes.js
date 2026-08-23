import express from "express";
import {
  getResources, uploadResource, deleteResource,
} from "../../controllers/instructor/resourceLibraryController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isInstructor from "../../middlewares/auth/isInstructor.js";
import documentUpload from "../../middlewares/upload/documentUpload.js";

const router = express.Router();
router.use(authenticate, isInstructor);

router.get("/", getResources);
router.post("/upload", documentUpload.single("file"), uploadResource);
router.delete("/:id", deleteResource);

export default router;