import Category from "../../models/course/Category.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

export const getInstructorCategories = asyncHandler(
  async (req, res) => {
    const categories = await Category.find({
      isActive: true,
    })
      .select("_id name slug description icon color")
      .sort({ name: 1 });

    return sendResponse(
      res,
      200,
      "Categories retrieved",
      categories
    );
  }
);
