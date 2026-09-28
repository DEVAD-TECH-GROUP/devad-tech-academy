import mongoose from "mongoose";

import User from "../../models/user/User.js";
import Instructor from "../../models/user/Instructor.js";

import asyncHandler from "../../middlewares/error/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";


/*
============================================================
HELPERS
============================================================
*/


/**
 * Get authenticated user's ID.
 */
const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};


/**
 * Convert expertise input into an array.
 *
 * Supports:
 *
 * "JavaScript, Python, React"
 *
 * or:
 *
 * ["JavaScript", "Python", "React"]
 */
const normalizeExpertise = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};


/**
 * Convert experience input into a number.
 *
 * Supports:
 *
 * "5"
 * 5
 * "5 years"
 * "5 years of experience"
 */
const normalizeExperience = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const number =
    typeof value === "number"
      ? value
      : Number.parseFloat(
          String(value).match(/\d+(\.\d+)?/)?.[0]
        );

  if (Number.isNaN(number)) {
    return null;
  }

  return number;
};


/**
 * Build CV object from multer-storage-cloudinary.
 */
const buildCVData = (file) => {
  if (!file) {
    return null;
  }

  return {
    url: file.path || null,
    publicId: file.filename || null,
    originalName: file.originalname || null,
  };
};


/**
 * Populate application consistently.
 */
const populateApplication = (query) => {
  return query.populate(
    "user",
    "firstName lastName email phone role"
  );
};


/*
============================================================
1. SUBMIT INSTRUCTOR APPLICATION
============================================================

POST /api/instructor/applications
============================================================
*/

export const submitInstructorApplication = asyncHandler(
  async (req, res) => {
    const userId = getUserId(req);

    if (!userId) {
      return sendResponse(
        res,
        401,
        false,
        "Authentication required"
      );
    }

    /*
    --------------------------------------------------------
    FIND USER
    --------------------------------------------------------
    */

    const user = await User.findById(userId);

    if (!user) {
      return sendResponse(
        res,
        404,
        false,
        "User account not found"
      );
    }

    /*
    --------------------------------------------------------
    GET FORM DATA
    --------------------------------------------------------
    */

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
    } = req.body;

    /*
    --------------------------------------------------------
    REQUIRED VALIDATION
    --------------------------------------------------------
    */

    if (!name?.trim()) {
      return sendResponse(
        res,
        400,
        false,
        "Full name is required"
      );
    }

    if (!email?.trim()) {
      return sendResponse(
        res,
        400,
        false,
        "Email is required"
      );
    }

    if (!phone?.trim()) {
      return sendResponse(
        res,
        400,
        false,
        "Phone number is required"
      );
    }

    const normalizedExpertise =
      normalizeExpertise(expertise);

    if (normalizedExpertise.length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "At least one area of expertise is required"
      );
    }

    const normalizedExperience =
      normalizeExperience(experience);

    if (
      normalizedExperience === null ||
      normalizedExperience < 0
    ) {
      return sendResponse(
        res,
        400,
        false,
        "Valid years of experience are required"
      );
    }

    if (!teachingExperience?.trim()) {
      return sendResponse(
        res,
        400,
        false,
        "Teaching experience is required"
      );
    }

    if (!course?.trim()) {
      return sendResponse(
        res,
        400,
        false,
        "Course selection is required"
      );
    }

    if (!availability?.trim()) {
      return sendResponse(
        res,
        400,
        false,
        "Availability is required"
      );
    }

    if (!coverLetter?.trim()) {
      return sendResponse(
        res,
        400,
        false,
        "Cover letter is required"
      );
    }

    /*
    --------------------------------------------------------
    CHECK EXISTING APPLICATION
    --------------------------------------------------------
    */

    const existingApplication =
      await Instructor.findOne({
        user: userId,
      });

    /*
    --------------------------------------------------------
    PENDING
    --------------------------------------------------------
    */

    if (
      existingApplication?.applicationStatus ===
      "pending"
    ) {
      return sendResponse(
        res,
        409,
        false,
        "You already have a pending instructor application"
      );
    }

    /*
    --------------------------------------------------------
    APPROVED
    --------------------------------------------------------
    */

    if (
      existingApplication?.applicationStatus ===
      "approved"
    ) {
      return sendResponse(
        res,
        409,
        false,
        "Your instructor application has already been approved"
      );
    }

    /*
    --------------------------------------------------------
    UPDATE USER BASIC INFORMATION
    --------------------------------------------------------
    */

    const nameParts = name
      .trim()
      .split(/\s+/);

    const firstName =
      nameParts.shift();

    const lastName =
      nameParts.join(" ");

    user.firstName = firstName;

    if (lastName) {
      user.lastName = lastName;
    }

    user.phone = phone.trim();

    await user.save();

    /*
    --------------------------------------------------------
    APPLICATION DATA
    --------------------------------------------------------
    */

    const applicationData = {
      user: userId,

      applicationEmail:
        email.trim().toLowerCase(),

      applicationPhone:
        phone.trim(),

      expertise:
        normalizedExpertise,

      experience:
        normalizedExperience,

      portfolio:
        portfolio?.trim() || null,

      teachingExperience:
        teachingExperience.trim(),

      course:
        course.trim(),

      availability:
        availability.trim(),

      coverLetter:
        coverLetter.trim(),

      applicationStatus:
        "pending",

      applicationDate:
        new Date(),

      approvedBy: null,

      approvedAt: null,

      rejectionReason: null,
    };

    /*
    --------------------------------------------------------
    CV
    --------------------------------------------------------
    */

    if (req.file) {
      applicationData.cv =
        buildCVData(req.file);
    }

    /*
    --------------------------------------------------------
    CREATE OR RESUBMIT
    --------------------------------------------------------
    */

    let application;

    if (existingApplication) {
      /*
      Rejected application is being resubmitted.
      */

      Object.assign(
        existingApplication,
        applicationData
      );

      application =
        await existingApplication.save();
    } else {
      application =
        await Instructor.create(
          applicationData
        );
    }

    /*
    --------------------------------------------------------
    GET POPULATED APPLICATION
    --------------------------------------------------------
    */

    application =
      await populateApplication(
        Instructor.findById(
          application._id
        )
      );

    return sendResponse(
      res,
      201,
      true,
      "Instructor application submitted successfully",
      application
    );
  }
);


/*
============================================================
2. GET MY INSTRUCTOR APPLICATION
============================================================

GET /api/instructor/applications/me
============================================================
*/

export const getMyInstructorApplication =
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);

    if (!userId) {
      return sendResponse(
        res,
        401,
        false,
        "Authentication required"
      );
    }

    const application =
      await populateApplication(
        Instructor.findOne({
          user: userId,
        })
      );

    if (!application) {
      return sendResponse(
        res,
        404,
        false,
        "No instructor application found"
      );
    }

    return sendResponse(
      res,
      200,
      true,
      "Instructor application retrieved successfully",
      application
    );
  });


/*
============================================================
3. GET SPECIFIC APPLICATION
============================================================

GET /api/instructor/applications/:id

IMPORTANT:
Applicant can only access their own application.
============================================================
*/

export const getInstructorApplication =
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return sendResponse(
        res,
        401,
        false,
        "Authentication required"
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return sendResponse(
        res,
        400,
        false,
        "Invalid application ID"
      );
    }

    const application =
      await populateApplication(
        Instructor.findOne({
          _id: id,
          user: userId,
        })
      );

    if (!application) {
      return sendResponse(
        res,
        404,
        false,
        "Instructor application not found"
      );
    }

    return sendResponse(
      res,
      200,
      true,
      "Instructor application retrieved successfully",
      application
    );
  });


/*
============================================================
4. UPDATE MY INSTRUCTOR APPLICATION
============================================================

PUT /api/instructor/applications/:id
============================================================
*/

export const updateInstructorApplication =
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return sendResponse(
        res,
        401,
        false,
        "Authentication required"
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return sendResponse(
        res,
        400,
        false,
        "Invalid application ID"
      );
    }

    /*
    --------------------------------------------------------
    FIND OWN APPLICATION
    --------------------------------------------------------
    */

    const application =
      await Instructor.findOne({
        _id: id,
        user: userId,
      });

    if (!application) {
      return sendResponse(
        res,
        404,
        false,
        "Instructor application not found"
      );
    }

    /*
    --------------------------------------------------------
    APPROVED APPLICATION
    --------------------------------------------------------
    */

    if (
      application.applicationStatus ===
      "approved"
    ) {
      return sendResponse(
        res,
        409,
        false,
        "An approved instructor application cannot be edited"
      );
    }

    /*
    --------------------------------------------------------
    FORM DATA
    --------------------------------------------------------
    */

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
    } = req.body;

    /*
    --------------------------------------------------------
    VALIDATE PROVIDED EXPERTISE
    --------------------------------------------------------
    */

    if (expertise !== undefined) {
      const normalizedExpertise =
        normalizeExpertise(
          expertise
        );

      if (
        normalizedExpertise.length === 0
      ) {
        return sendResponse(
          res,
          400,
          false,
          "At least one area of expertise is required"
        );
      }

      application.expertise =
        normalizedExpertise;
    }

    /*
    --------------------------------------------------------
    EXPERIENCE
    --------------------------------------------------------
    */

    if (experience !== undefined) {
      const normalizedExperience =
        normalizeExperience(
          experience
        );

      if (
        normalizedExperience === null ||
        normalizedExperience < 0
      ) {
        return sendResponse(
          res,
          400,
          false,
          "Valid years of experience are required"
        );
      }

      application.experience =
        normalizedExperience;
    }

    /*
    --------------------------------------------------------
    EMAIL
    --------------------------------------------------------
    */

    if (email !== undefined) {
      if (!email.trim()) {
        return sendResponse(
          res,
          400,
          false,
          "Email cannot be empty"
        );
      }

      application.applicationEmail =
        email
          .trim()
          .toLowerCase();
    }

    /*
    --------------------------------------------------------
    PHONE
    --------------------------------------------------------
    */

    if (phone !== undefined) {
      if (!phone.trim()) {
        return sendResponse(
          res,
          400,
          false,
          "Phone number cannot be empty"
        );
      }

      application.applicationPhone =
        phone.trim();
    }

    /*
    --------------------------------------------------------
    PORTFOLIO
    --------------------------------------------------------
    */

    if (portfolio !== undefined) {
      application.portfolio =
        portfolio.trim() || null;
    }

    /*
    --------------------------------------------------------
    TEACHING EXPERIENCE
    --------------------------------------------------------
    */

    if (
      teachingExperience !==
      undefined
    ) {
      if (
        !teachingExperience.trim()
      ) {
        return sendResponse(
          res,
          400,
          false,
          "Teaching experience cannot be empty"
        );
      }

      application.teachingExperience =
        teachingExperience.trim();
    }

    /*
    --------------------------------------------------------
    COURSE
    --------------------------------------------------------
    */

    if (course !== undefined) {
      if (!course.trim()) {
        return sendResponse(
          res,
          400,
          false,
          "Course cannot be empty"
        );
      }

      application.course =
        course.trim();
    }

    /*
    --------------------------------------------------------
    AVAILABILITY
    --------------------------------------------------------
    */

    if (availability !== undefined) {
      if (!availability.trim()) {
        return sendResponse(
          res,
          400,
          false,
          "Availability cannot be empty"
        );
      }

      application.availability =
        availability.trim();
    }

    /*
    --------------------------------------------------------
    COVER LETTER
    --------------------------------------------------------
    */

    if (coverLetter !== undefined) {
      if (!coverLetter.trim()) {
        return sendResponse(
          res,
          400,
          false,
          "Cover letter cannot be empty"
        );
      }

      application.coverLetter =
        coverLetter.trim();
    }

    /*
    --------------------------------------------------------
    NAME / USER PROFILE
    --------------------------------------------------------
    */

    if (name?.trim()) {
      const nameParts =
        name.trim().split(/\s+/);

      const firstName =
        nameParts.shift();

      const lastName =
        nameParts.join(" ");

      const user =
        await User.findById(userId);

      if (user) {
        user.firstName =
          firstName;

        user.lastName =
          lastName || "";

        await user.save();
      }
    }

    /*
    --------------------------------------------------------
    UPDATE USER PHONE
    --------------------------------------------------------
    */

    if (phone?.trim()) {
      const user =
        await User.findById(userId);

      if (user) {
        user.phone =
          phone.trim();

        await user.save();
      }
    }

    /*
    --------------------------------------------------------
    NEW CV
    --------------------------------------------------------
    */

    if (req.file) {
      application.cv =
        buildCVData(req.file);
    }

    /*
    --------------------------------------------------------
    REJECTED → PENDING
    --------------------------------------------------------
    */

    if (
      application.applicationStatus ===
      "rejected"
    ) {
      application.applicationStatus =
        "pending";

      application.applicationDate =
        new Date();

      application.rejectionReason =
        null;

      application.approvedBy =
        null;

      application.approvedAt =
        null;
    }

    /*
    --------------------------------------------------------
    SAVE
    --------------------------------------------------------
    */

    await application.save();

    /*
    --------------------------------------------------------
    RETURN UPDATED APPLICATION
    --------------------------------------------------------
    */

    const updatedApplication =
      await populateApplication(
        Instructor.findById(
          application._id
        )
      );

    return sendResponse(
      res,
      200,
      true,
      "Instructor application updated successfully",
      updatedApplication
    );
  });


/*
============================================================
5. WITHDRAW INSTRUCTOR APPLICATION
============================================================

DELETE /api/instructor/applications/:id
============================================================
*/

export const withdrawInstructorApplication =
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return sendResponse(
        res,
        401,
        false,
        "Authentication required"
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return sendResponse(
        res,
        400,
        false,
        "Invalid application ID"
      );
    }

    /*
    --------------------------------------------------------
    FIND OWN APPLICATION
    --------------------------------------------------------
    */

    const application =
      await Instructor.findOne({
        _id: id,
        user: userId,
      });

    if (!application) {
      return sendResponse(
        res,
        404,
        false,
        "Instructor application not found"
      );
    }

    /*
    --------------------------------------------------------
    APPROVED APPLICATION
    --------------------------------------------------------
    */

    if (
      application.applicationStatus ===
      "approved"
    ) {
      return sendResponse(
        res,
        409,
        false,
        "An approved instructor application cannot be withdrawn"
      );
    }

    /*
    --------------------------------------------------------
    DELETE APPLICATION
    --------------------------------------------------------
    */

    await Instructor.deleteOne({
      _id: application._id,
      user: userId,
    });

    return sendResponse(
      res,
      200,
      true,
      "Instructor application withdrawn successfully"
    );
  });
