import User from "../../models/user/User.js";
import Student from "../../models/user/Student.js";
import Instructor from "../../models/user/Instructor.js";
import SuperAdmin from "../../models/user/SuperAdmin.js";
import Enrollment from "../../models/learning/Enrollment.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import auditLogger from "../../services/audit/auditLogger.js";
import { AUDIT_TYPES, ROLES } from "../../utils/constants.js";
import {
  createUserValidator,
  updateUserValidator,
} from "../../validators/superadmin/userValidator.js";
import { generateReferralCode } from "../../utils/generateCode.js";

// ── Get all users ─────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, status, search } = req.query;

  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const result = await paginate(User, query, { page, limit });
  sendResponse(res, 200, "Users retrieved", result);
});

// ── Get single user ───────────────────────────────────────
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendResponse(res, 404, "User not found");
  sendResponse(res, 200, "User retrieved", user);
});

// ── Create user ───────────────────────────────────────────
export const createUser = asyncHandler(async (req, res) => {
  const { error } = createUserValidator(req.body);
  if (error) {
    return sendResponse(
      res, 400,
      error.details.map((d) => d.message).join(", ")
    );
  }

  const { firstName, lastName, email, password, role, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return sendResponse(res, 400, "Email already exists");

  const user = await User.create({
    firstName, lastName, email, password, role, phone,
    isEmailVerified: true,
    referralCode: generateReferralCode(`${firstName} ${lastName}`),
  });

  if (role === ROLES.STUDENT) await Student.create({ user: user._id });
  else if (role === ROLES.INSTRUCTOR) await Instructor.create({ user: user._id });
  else if (role === ROLES.SUPER_ADMIN) await SuperAdmin.create({ user: user._id });

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Created user: ${email} (${role})`,
    type: AUDIT_TYPES.USER,
    targetModel: "User",
    targetId: user._id,
    ipAddress: req.ip,
  });

  sendResponse(res, 201, "User created", user);
});

// ── Update user ───────────────────────────────────────────
export const updateUser = asyncHandler(async (req, res) => {
  const { error } = updateUserValidator(req.body);
  if (error) {
    return sendResponse(
      res, 400,
      error.details.map((d) => d.message).join(", ")
    );
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!user) return sendResponse(res, 404, "User not found");

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Updated user: ${user.email}`,
    type: AUDIT_TYPES.USER,
    targetModel: "User",
    targetId: user._id,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "User updated", user);
});

// ── Delete user ───────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendResponse(res, 404, "User not found");

  await User.findByIdAndDelete(req.params.id);

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Deleted user: ${user.email}`,
    type: AUDIT_TYPES.USER,
    targetModel: "User",
    targetId: user._id,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "User deleted");
});

// ── Suspend user ──────────────────────────────────────────
export const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: "suspended" },
    { new: true }
  );

  if (!user) return sendResponse(res, 404, "User not found");

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Suspended user: ${user.email}`,
    type: AUDIT_TYPES.SECURITY,
    targetModel: "User",
    targetId: user._id,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "User suspended", user);
});

// ── Activate user ─────────────────────────────────────────
export const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: "active" },
    { new: true }
  );

  if (!user) return sendResponse(res, 404, "User not found");

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Activated user: ${user.email}`,
    type: AUDIT_TYPES.USER,
    targetModel: "User",
    targetId: user._id,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "User activated", user);
});

// ── Change user role ──────────────────────────────────────
export const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );

  if (!user) return sendResponse(res, 404, "User not found");

  await auditLogger({
    actor: req.user._id,
    actorRole: req.user.role,
    action: `Changed role of ${user.email} to ${role}`,
    type: AUDIT_TYPES.USER,
    targetModel: "User",
    targetId: user._id,
    ipAddress: req.ip,
  });

  sendResponse(res, 200, "User role updated", user);
});

// ── Import users ──────────────────────────────────────────
export const importUsers = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Users imported successfully");
});

// ── Export users ──────────────────────────────────────────
export const exportUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select(
    "firstName lastName email role status createdAt lastLogin"
  );

  sendResponse(res, 200, "Users exported", users);
});