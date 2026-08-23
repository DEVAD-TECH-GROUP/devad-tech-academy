import asyncHandler from "../error/asyncHandler.js";
import sendResponse from "../../utils/sendResponse.js";
import { ROLES } from "../../utils/constants.js";

const isSuperAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === ROLES.SUPER_ADMIN) {
    next();
  } else {
    return sendResponse(
      res,
      403,
      "Access denied. Super Admin only"
    );
  }
});

export default isSuperAdmin;