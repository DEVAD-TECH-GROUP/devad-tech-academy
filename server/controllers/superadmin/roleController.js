import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { ROLES } from "../../utils/constants.js";

export const getRoles = asyncHandler(async (req, res) => {
  const roles = [
    {
      name: ROLES.SUPER_ADMIN,
      label: "Super Admin",
      description: "Full platform control",
      permissions: ["all"],
    },
    {
      name: ROLES.INSTRUCTOR,
      label: "Instructor",
      description: "Course and student management",
      permissions: [
        "manage_courses", "manage_students",
        "view_earnings", "host_live_classes",
      ],
    },
    {
      name: ROLES.STUDENT,
      label: "Student",
      description: "Standard learner access",
      permissions: [
        "view_courses", "enroll_courses",
        "submit_assignments", "take_quizzes",
      ],
    },
  ];

  sendResponse(res, 200, "Roles retrieved", roles);
});

export const updateRole = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Role updated");
});

export const createRole = asyncHandler(async (req, res) => {
  sendResponse(res, 201, "Custom role created");
});

export const deleteRole = asyncHandler(async (req, res) => {
  sendResponse(res, 200, "Role deleted");
});

export const getPermissions = asyncHandler(async (req, res) => {
  const permissions = [
    "manage_users", "manage_courses", "manage_payments",
    "manage_settings", "view_analytics", "manage_community",
    "manage_support", "manage_ai", "view_audit_logs",
  ];

  sendResponse(res, 200, "Permissions retrieved", permissions);
});