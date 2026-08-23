import User from "../../models/user/User.js";
import Instructor from "../../models/user/Instructor.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { updateProfileValidator } from "../../validators/student/profileValidator.js";

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const instructor = await Instructor.findOne({ user: req.user._id });
  sendResponse(res, 200, "Profile retrieved", { user, instructor });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { error } = updateProfileValidator(req.body);
  if (error) return sendResponse(res, 400, error.details[0].message);

  const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
  sendResponse(res, 200, "Profile updated", user);
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return sendResponse(res, 400, "No image uploaded");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: { url: req.file.path, public_id: req.file.public_id } },
    { new: true }
  );
  sendResponse(res, 200, "Avatar updated", user);
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return sendResponse(res, 400, "Current password is incorrect");

  user.password = newPassword;
  await user.save();
  sendResponse(res, 200, "Password updated");
});

export const enable2FA = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isTwoFactorEnabled: true });
  sendResponse(res, 200, "2FA enabled");
});

export const updateSettings = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
  sendResponse(res, 200, "Settings updated", user);
});