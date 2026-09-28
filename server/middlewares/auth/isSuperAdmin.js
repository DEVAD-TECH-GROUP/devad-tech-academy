import sendResponse from "../../utils/sendResponse.js";
import { ROLES } from "../../utils/constants.js";

const isSuperAdmin = (req, res, next) => {
  console.log("========== isSuperAdmin ==========");
  console.log("req.user:", req.user);
  console.log("role:", req.user?.role);
  console.log("expected:", ROLES.SUPER_ADMIN);
  console.log("next type:", typeof next);
  console.log("===================================");

  if (req.user && req.user.role === ROLES.SUPER_ADMIN) {
    console.log("isSuperAdmin: AUTHORIZED");
    return next();
  }

  console.log("isSuperAdmin: DENIED");

  return sendResponse(
    res,
    403,
    "Access denied. Super Admin only"
  );
};

export default isSuperAdmin;