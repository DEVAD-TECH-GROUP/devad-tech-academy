import sendResponse from "../../utils/sendResponse.js";
import { ROLES } from "../../utils/constants.js";

const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === ROLES.SUPER_ADMIN) {
    return next();
  }

  return sendResponse(
    res,
    403,
    "Access denied. Super Admin only"
  );
};

export default isSuperAdmin;