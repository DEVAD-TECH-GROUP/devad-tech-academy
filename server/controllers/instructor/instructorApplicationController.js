import crypto from "crypto";
import mongoose from "mongoose";

import User from "../../models/user/User.js";
import Instructor from "../../models/user/Instructor.js";

import asyncHandler from "../../middlewares/error/asyncHandler.js";
import sendResponse from "../../utils/sendResponse.js";

/*
============================================================
HELPERS
============================================================
*/

const getUserId = (req) => req.user?._id || req.user?.id || null;

const clean = (v) => String(v ?? "").trim();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "JavaScript, Python" or ["JavaScript", "Python"] -> array
const normalizeExpertise = (value) => {
  if (Array.isArray(value)) {
    return value.map((i) => String(i).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);
  }
  return [];
};

// "5", 5, "5 years" -> 5
const normalizeExperience = (value) => {
  if (value === undefined || value === null || value === "") return null;

  const matched = String(value).match(/\d+(\.\d+)?/);
  if (!matched) return null;

  const number = Number.parseFloat(matched[0]);
  return Number.isNaN(number) ? null : number;
};

// JSON string or array -> array
const parseJSONArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeEducation = (value) =>
  parseJSONArray(value)
    .map((i) => ({
      degree: clean(i?.degree),
      institution: clean(i?.institution),
      year: clean(i?.year),
    }))
    .filter((i) => i.degree || i.institution);

const normalizeCertifications = (value) =>
  parseJSONArray(value)
    .map((i) => ({
      name: clean(i?.name),
      issuer: clean(i?.issuer),
      year: clean(i?.year),
      url: clean(i?.url),
    }))
    .filter((i) => i.name);

// multer-storage-cloudinary file -> CV object
const buildCVData = (file) => {
  if (!file) return null;

  return {
    url: file.path || null,
    publicId: file.filename || null,
    originalName: file.originalname || null,
  };
};

const populateApplication = (query) =>
  query.populate("user", "firstName lastName email phone role");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/*
============================================================
1. SUBMIT INSTRUCTOR APPLICATION  (PUBLIC - no login)
POST /api/instructor/applications
============================================================
*/

export const submitInstructorApplication = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    expertise,
    experience,
    portfolio,
    teachingExperience,
    course,
    availability,
    coverLetter,
    education,
    certifications,
  } = req.body;

  /* ---------- Required fields ---------- */

  const required = {
    "Full name": name,
    Email: email,
    "Phone number": phone,
    "Teaching experience": teachingExperience,
    Course: course,
    Availability: availability,
    "Cover letter": coverLetter,
  };

  for (const [label, value] of Object.entries(required)) {
    if (!clean(value)) {
      return sendResponse(res, 400, `${label} is required`);
    }
  }

  const normalizedEmail = clean(email).toLowerCase();

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return sendResponse(res, 400, "A valid email is required");
  }

  const normalizedExpertise = normalizeExpertise(expertise);

  if (normalizedExpertise.length === 0) {
    return sendResponse(res, 400, "At least one area of expertise is required");
  }

  const normalizedExperience = normalizeExperience(experience);

  if (normalizedExperience === null || normalizedExperience < 0) {
    return sendResponse(res, 400, "Valid years of experience are required");
  }

  /* ---------- Find or create User (existing users are never modified) ---------- */

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const [firstName, ...rest] = clean(name).split(/\s+/);

    user = await User.create({
      firstName,
      lastName: rest.join(" "),
      email: normalizedEmail,
      phone: clean(phone),
      password: crypto.randomBytes(24).toString("hex"),
      role: "student",
    });
  }

  /* ---------- Existing application checks ---------- */

  const existingApplication = await Instructor.findOne({ user: user._id });

  if (existingApplication?.applicationStatus === "pending") {
    return sendResponse(
      res,
      409,
      "An instructor application with this email is already pending"
    );
  }

  if (existingApplication?.applicationStatus === "approved") {
    return sendResponse(
      res,
      409,
      "An instructor application with this email has already been approved"
    );
  }

  /* ---------- Application data ---------- */

  const applicationData = {
    user: user._id,
    applicationEmail: normalizedEmail,
    applicationPhone: clean(phone),
    expertise: normalizedExpertise,
    experience: normalizedExperience,
    portfolio: clean(portfolio) || null,
    teachingExperience: clean(teachingExperience),
    course: clean(course),
    availability: clean(availability),
    coverLetter: clean(coverLetter),
    education: normalizeEducation(education),
    certifications: normalizeCertifications(certifications),
    applicationStatus: "pending",
    applicationDate: new Date(),
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
  };

  if (req.file) {
    applicationData.cv = buildCVData(req.file);
  }

  /* ---------- Create or resubmit (rejected) ---------- */

  let application;

  if (existingApplication) {
    Object.assign(existingApplication, applicationData);
    application = await existingApplication.save();
  } else {
    application = await Instructor.create(applicationData);
  }

  /* ---------- Response (minimal: endpoint is public) ---------- */

  return sendResponse(
    res,
    201,
    "Instructor application submitted successfully",
    {
      _id: application._id,
      applicationStatus: application.applicationStatus,
    }
  );
});

/*
============================================================
2. GET MY INSTRUCTOR APPLICATION
GET /api/instructor/applications/me
============================================================
*/

export const getMyInstructorApplication = asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  if (!userId) {
    return sendResponse(res, 401, "Authentication required");
  }

  const application = await populateApplication(
    Instructor.findOne({ user: userId })
  );

  if (!application) {
    return sendResponse(res, 404, "No instructor application found");
  }

  return sendResponse(
    res,
    200,
    "Instructor application retrieved successfully",
    application
  );
});

/*
============================================================
3. GET SPECIFIC APPLICATION (own only)
GET /api/instructor/applications/:id
============================================================
*/

export const getInstructorApplication = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;

  if (!userId) {
    return sendResponse(res, 401, "Authentication required");
  }

  if (!isValidObjectId(id)) {
    return sendResponse(res, 400, "Invalid application ID");
  }

  const application = await populateApplication(
    Instructor.findOne({ _id: id, user: userId })
  );

  if (!application) {
    return sendResponse(res, 404, "Instructor application not found");
  }

  return sendResponse(
    res,
    200,
    "Instructor application retrieved successfully",
    application
  );
});

/*
============================================================
4. UPDATE MY INSTRUCTOR APPLICATION
PUT /api/instructor/applications/:id
============================================================
*/

export const updateInstructorApplication = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;

  if (!userId) {
    return sendResponse(res, 401, "Authentication required");
  }

  if (!isValidObjectId(id)) {
    return sendResponse(res, 400, "Invalid application ID");
  }

  const application = await Instructor.findOne({ _id: id, user: userId });

  if (!application) {
    return sendResponse(res, 404, "Instructor application not found");
  }

  if (application.applicationStatus === "approved") {
    return sendResponse(
      res,
      409,
      "An approved instructor application cannot be edited"
    );
  }

  const {
    name,
    email,
    phone,
    expertise,
    experience,
    portfolio,
    teachingExperience,
    course,
    availability,
    coverLetter,
    education,
    certifications,
  } = req.body;

  /* ---------- Expertise ---------- */

  if (expertise !== undefined) {
    const normalizedExpertise = normalizeExpertise(expertise);

    if (normalizedExpertise.length === 0) {
      return sendResponse(
        res,
        400,
        "At least one area of expertise is required"
      );
    }

    application.expertise = normalizedExpertise;
  }

  /* ---------- Experience ---------- */

  if (experience !== undefined) {
    const normalizedExperience = normalizeExperience(experience);

    if (normalizedExperience === null || normalizedExperience < 0) {
      return sendResponse(res, 400, "Valid years of experience are required");
    }

    application.experience = normalizedExperience;
  }

  /* ---------- Email ---------- */

  if (email !== undefined) {
    const normalizedEmail = clean(email).toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return sendResponse(res, 400, "A valid email is required");
    }

    application.applicationEmail = normalizedEmail;
  }

  /* ---------- Phone ---------- */

  let normalizedPhone;

  if (phone !== undefined) {
    normalizedPhone = clean(phone);

    if (!normalizedPhone) {
      return sendResponse(res, 400, "Phone number cannot be empty");
    }

    application.applicationPhone = normalizedPhone;
  }

  /* ---------- Portfolio ---------- */

  if (portfolio !== undefined) {
    application.portfolio = clean(portfolio) || null;
  }

  /* ---------- Teaching experience ---------- */

  if (teachingExperience !== undefined) {
    const value = clean(teachingExperience);

    if (!value) {
      return sendResponse(res, 400, "Teaching experience cannot be empty");
    }

    application.teachingExperience = value;
  }

  /* ---------- Course ---------- */

  if (course !== undefined) {
    const value = clean(course);

    if (!value) {
      return sendResponse(res, 400, "Course cannot be empty");
    }

    application.course = value;
  }

  /* ---------- Availability ---------- */

  if (availability !== undefined) {
    const value = clean(availability);

    if (!value) {
      return sendResponse(res, 400, "Availability cannot be empty");
    }

    application.availability = value;
  }

  /* ---------- Cover letter ---------- */

  if (coverLetter !== undefined) {
    const value = clean(coverLetter);

    if (!value) {
      return sendResponse(res, 400, "Cover letter cannot be empty");
    }

    application.coverLetter = value;
  }

  /* ---------- Education / certifications ---------- */

  if (education !== undefined) {
    application.education = normalizeEducation(education);
  }

  if (certifications !== undefined) {
    application.certifications = normalizeCertifications(certifications);
  }

  /* ---------- Sync user profile (name / phone) ---------- */

  let normalizedName;

  if (name !== undefined) {
    normalizedName = clean(name);

    if (!normalizedName) {
      return sendResponse(res, 400, "Name cannot be empty");
    }
  }

  if (normalizedName || normalizedPhone) {
    const user = await User.findById(userId);

    if (user) {
      if (normalizedName) {
        const [firstName, ...rest] = normalizedName.split(/\s+/);
        user.firstName = firstName;
        user.lastName = rest.join(" ");
      }

      if (normalizedPhone) {
        user.phone = normalizedPhone;
      }

      await user.save();
    }
  }

  /* ---------- New CV ---------- */

  if (req.file) {
    application.cv = buildCVData(req.file);
  }

  /* ---------- Rejected -> pending ---------- */

  if (application.applicationStatus === "rejected") {
    application.applicationStatus = "pending";
    application.applicationDate = new Date();
    application.rejectionReason = null;
    application.approvedBy = null;
    application.approvedAt = null;
  }

  await application.save();

  const updatedApplication = await populateApplication(
    Instructor.findById(application._id)
  );

  return sendResponse(
    res,
    200,
    "Instructor application updated successfully",
    updatedApplication
  );
});

/*
============================================================
5. WITHDRAW INSTRUCTOR APPLICATION
DELETE /api/instructor/applications/:id
============================================================
*/

export const withdrawInstructorApplication = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;

  if (!userId) {
    return sendResponse(res, 401, "Authentication required");
  }

  if (!isValidObjectId(id)) {
    return sendResponse(res, 400, "Invalid application ID");
  }

  const application = await Instructor.findOne({ _id: id, user: userId });

  if (!application) {
    return sendResponse(res, 404, "Instructor application not found");
  }

  if (application.applicationStatus === "approved") {
    return sendResponse(
      res,
      409,
      "An approved instructor application cannot be withdrawn"
    );
  }

  await Instructor.deleteOne({ _id: application._id, user: userId });

  return sendResponse(
    res,
    200,
    "Instructor application withdrawn successfully"
  );
});

