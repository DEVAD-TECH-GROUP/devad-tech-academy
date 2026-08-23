import express from "express";
import {
  getRoles, updateRole, createRole, deleteRole, getPermissions,
} from "../../controllers/superadmin/roleController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getRoles);
router.post("/", createRole);
router.get("/permissions", getPermissions);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;