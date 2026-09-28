import sendResponse from "../../utils/sendResponse.js";
import { ROLES } from "../../utils/constants.js";

const isInstructor = (req, res, next) => {
  if (
    req.user &&
    (
      req.user.role === ROLES.INSTRUCTOR ||
      req.user.role === ROLES.SUPER_ADMIN
    )
  ) {
    return next();
  }

  return sendResponse(
    res,
    403,
    "Access denied. Instructors only"
  );
};

export default isInstructor;