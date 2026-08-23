import Category from "../../models/course/Category.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import {
  createCategoryValidator,
} from "../../validators/superadmin/courseValidator.js";

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  sendResponse(res, 200, "Categories retrieved", categories);
});

export const createCategory = asyncHandler(async (req, res) => {
  const { error } = createCategoryValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const category = await Category.create({
    ...req.body,
    createdBy: req.user._id,
  });

  sendResponse(res, 201, "Category created", category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!category) return sendResponse(res, 404, "Category not found");
  sendResponse(res, 200, "Category updated", category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!category) return sendResponse(res, 404, "Category not found");
  sendResponse(res, 200, "Category deleted");
});