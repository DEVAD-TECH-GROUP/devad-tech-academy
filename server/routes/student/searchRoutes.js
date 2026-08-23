import express from "express";
import { search } from "../../controllers/student/searchController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isStudent from "../../middlewares/auth/isStudent.js";

const router = express.Router();
router.use(authenticate, isStudent);

router.get("/", search);

export default router;