import express from "express";
import {
  getAllUsers, getUser, createUser, updateUser,
  deleteUser, suspendUser, activateUser,
  changeUserRole, importUsers, exportUsers,
} from "../../controllers/superadmin/userController.js";
import authenticate from "../../middlewares/auth/authenticate.js";
import isSuperAdmin from "../../middlewares/auth/isSuperAdmin.js";

const router = express.Router();
router.use(authenticate, isSuperAdmin);

router.get("/", getAllUsers);
router.post("/", createUser);
router.get("/export", exportUsers);
router.post("/import", importUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.put("/:id/suspend", suspendUser);
router.put("/:id/activate", activateUser);
router.put("/:id/role", changeUserRole);

export default router;