import asyncHandler from "../error/asyncHandler.js";
import sendResponse from "../../utils/sendResponse.js";
import { ROLES } from "../../utils/constants.js";

const isOwner = (Model, ownerField = "createdBy") =>
  asyncHandler(async (req, res, next) => {
    const resource = await Model.findById(req.params.id);

    if (!resource) {
      return sendResponse(res, 404, "Resource not found");
    }

    // ── Super admin can access everything ─────────────
    if (req.user.role === ROLES.SUPER_ADMIN) {
      req.resource = resource;
      return next();
    }

    // ── Check ownership ───────────────────────────────
    if (resource[ownerField].toString() !== req.user._id.toString()) {
      return sendResponse(
        res,
        403,
        "Access denied. You don't own this resource"
      );
    }

    req.resource = resource;
    next();
  });

export default isOwner;
