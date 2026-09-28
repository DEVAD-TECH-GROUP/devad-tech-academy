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

/**
 * Get authenticated user's ID.
 *
 * authenticate.js attaches the full User document to req.user.
 */
const getUserId = (req) => {
  return req.user?._id || req.user?.id || null;
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
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const matched = String(value).match(/\d+(\.\d+)?/);

  if (!matched) {
    return null;
  }

  const number = Number.parseFloat(matched[0]);

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

/**
 * Validate a MongoDB ObjectId.
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
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

    /*
    --------------------------------------------------------
    AUTHENTICATION
    --------------------------------------------------------
    */

    if (!userId) {
      return sendResponse(
        res,
        401,
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
        "Full name is required"
      );
    }

    if (!email?.trim()) {
      return sendResponse(
        res,
        400,
        "Email is required"
      );
    }

    if (!phone?.trim()) {
      return sendResponse(
        res,
        400,
        "Phone number is required"
      );
    }

    /*
    --------------------------------------------------------
    EXPERTISE
    --------------------------------------------------------
    */

    const normalizedExpertise =
      normalizeExpertise(expertise);

    if (normalizedExpertise.length === 0) {
      return sendResponse(
        res,
        400,
        "At least one area of expertise is required"
      );
    }

    /*
    --------------------------------------------------------
    EXPERIENCE
    --------------------------------------------------------
    */

    const normalizedExperience =
      normalizeExperience(experience);

    if (
      normalizedExperience === null ||
      normalizedExperience < 0
    ) {
      return sendResponse(
        res,
        400,
        "Valid years of experience are required"
      );
    }

    /*
    --------------------------------------------------------
    TEACHING EXPERIENCE
    --------------------------------------------------------
    */

    if (!teachingExperience?.trim()) {
      return sendResponse(
        res,
        400,
        "Teaching experience is required"
      );
    }

    /*
    --------------------------------------------------------
    COURSE
    --------------------------------------------------------
    */

    if (!course?.trim()) {
      return sendResponse(
        res,
        400,
        "Course selection is required"
      );
    }

    /*
    --------------------------------------------------------
    AVAILABILITY
    --------------------------------------------------------
    */

    if (!availability?.trim()) {
      return sendResponse(
        res,
        400,
        "Availability is required"
      );
    }

    /*
    --------------------------------------------------------
    COVER LETTER
    --------------------------------------------------------
    */

    if (!coverLetter?.trim()) {
      return sendResponse(
        res,
        400,
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
    PENDING APPLICATION
    --------------------------------------------------------
    */

    if (
      existingApplication?.applicationStatus ===
      "pending"
    ) {
      return sendResponse(
        res,
        409,
        "You already have a pending instructor application"
      );
    }

    /*
    --------------------------------------------------------
    APPROVED APPLICATION
    --------------------------------------------------------
    */

    if (
      existingApplication?.applicationStatus ===
      "approved"
    ) {
      return sendResponse(
        res,
        409,
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

    const firstName = nameParts.shift();
    const lastName = nameParts.join(" ");

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
      ------------------------------------------------------
      REJECTED APPLICATION RESUBMISSION
      ------------------------------------------------------
      */

      Object.assign(
        existingApplication,
        applicationData
      );

      application =
        await existingApplication.save();
    } else {
      /*
      ------------------------------------------------------
      NEW APPLICATION
      ------------------------------------------------------
      */

      application =
        await Instructor.create(
          applicationData
        );
    }

    /*
    --------------------------------------------------------
    POPULATE APPLICATION
    --------------------------------------------------------
    */

    application =
      await populateApplication(
        Instructor.findById(
          application._id
        )
      );

    /*
    --------------------------------------------------------
    RESPONSE
    --------------------------------------------------------
    */

    return sendResponse(
      res,
      201,
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

    /*
    --------------------------------------------------------
    AUTHENTICATION
    --------------------------------------------------------
    */

    if (!userId) {
      return sendResponse(
        res,
        401,
        "Authentication required"
      );
    }

    /*
    --------------------------------------------------------
    FIND APPLICATION
    --------------------------------------------------------
    */

    const application =
      await populateApplication(
        Instructor.findOne({
          user: userId,
        })
      );

    /*
    --------------------------------------------------------
    NOT FOUND
    --------------------------------------------------------
    */

    if (!application) {
      return sendResponse(
        res,
        404,
        "No instructor application found"
      );
    }

    /*
    --------------------------------------------------------
    RESPONSE
    --------------------------------------------------------
    */

    return sendResponse(
      res,
      200,
      "Instructor application retrieved successfully",
      application
    );
  });

/*
============================================================
3. GET SPECIFIC APPLICATION
============================================================

GET /api/instructor/applications/:id

Applicant can only access their own application.
============================================================
*/

export const getInstructorApplication =
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const { id } = req.params;

    /*
    --------------------------------------------------------
    AUTHENTICATION
    --------------------------------------------------------
    */

    if (!userId) {
      return sendResponse(
        res,
        401,
        "Authentication required"
      );
    }

    /*
    --------------------------------------------------------
    VALIDATE ID
    --------------------------------------------------------
    */

    if (!isValidObjectId(id)) {
      return sendResponse(
        res,
        400,
        "Invalid application ID"
      );
    }

    /*
    --------------------------------------------------------
    FIND OWN APPLICATION
    --------------------------------------------------------
    */

    const application =
      await populateApplication(
        Instructor.findOne({
          _id: id,
          user: userId,
        })
      );

    /*
    --------------------------------------------------------
    NOT FOUND
    --------------------------------------------------------
    */

    if (!application) {
      return sendResponse(
        res,
        404,
        "Instructor application not found"
      );
    }

    /*
    --------------------------------------------------------
    RESPONSE
    --------------------------------------------------------
    */

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
============================================================

PUT /api/instructor/applications/:id
============================================================
*/

export const updateInstructorApplication =
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const { id } = req.params;

    /*
    --------------------------------------------------------
    AUTHENTICATION
    --------------------------------------------------------
    */

    if (!userId) {
      return sendResponse(
        res,
        401,
        "Authentication required"
      );
    }

    /*
    --------------------------------------------------------
    VALIDATE ID
    --------------------------------------------------------
    */

    if (!isValidObjectId(id)) {
      return sendResponse(
        res,
        400,
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
    EXPERTISE
    --------------------------------------------------------
    */

    if (expertise !== undefined) {
      const normalizedExpertise =
        normalizeExpertise(expertise);

      if (normalizedExpertise.length === 0) {
        return sendResponse(
          res,
          400,
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
        normalizeExperience(experience);

      if (
        normalizedExperience === null ||
        normalizedExperience < 0
      ) {
        return sendResponse(
          res,
          400,
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
      const normalizedEmail =
        String(email).trim().toLowerCase();

      if (!normalizedEmail) {
        return sendResponse(
          res,
          400,
          "Email cannot be empty"
        );
      }

      application.applicationEmail =
        normalizedEmail;
    }

    /*
    --------------------------------------------------------
    PHONE
    --------------------------------------------------------
    */

    if (phone !== undefined) {
      const normalizedPhone =
        String(phone).trim();

      if (!normalizedPhone) {
        return sendResponse(
          res,
          400,
          "Phone number cannot be empty"
        );
      }

      application.applicationPhone =
        normalizedPhone;
    }

    /*
    --------------------------------------------------------
    PORTFOLIO
    --------------------------------------------------------
    */

    if (portfolio !== undefined) {
      application.portfolio =
        String(portfolio).trim() || null;
    }

    /*
    --------------------------------------------------------
    TEACHING EXPERIENCE
    --------------------------------------------------------
    */

    if (
      teachingExperience !== undefined
    ) {
      const normalizedTeachingExperience =
        String(teachingExperience).trim();

      if (!normalizedTeachingExperience) {
        return sendResponse(
          res,
          400,
          "Teaching experience cannot be empty"
        );
      }

      application.teachingExperience =
        normalizedTeachingExperience;
    }

    /*
    --------------------------------------------------------
    COURSE
    --------------------------------------------------------
    */

    if (course !== undefined) {
      const normalizedCourse =
        String(course).trim();

      if (!normalizedCourse) {
        return sendResponse(
          res,
          400,
          "Course cannot be empty"
        );
      }

      application.course =
        normalizedCourse;
    }

    /*
    --------------------------------------------------------
    AVAILABILITY
    --------------------------------------------------------
    */

    if (availability !== undefined) {
      const normalizedAvailability =
        String(availability).trim();

      if (!normalizedAvailability) {
        return sendResponse(
          res,
          400,
          "Availability cannot be empty"
        );
      }

      application.availability =
        normalizedAvailability;
    }

    /*
    --------------------------------------------------------
    COVER LETTER
    --------------------------------------------------------
    */

    if (coverLetter !== undefined) {
      const normalizedCoverLetter =
        String(coverLetter).trim();

      if (!normalizedCoverLetter) {
        return sendResponse(
          res,
          400,
          "Cover letter cannot be empty"
        );
      }

      application.coverLetter =
        normalizedCoverLetter;
    }

    /*
    --------------------------------------------------------
    NAME / USER PROFILE
    --------------------------------------------------------
    */

    if (name !== undefined) {
      const normalizedName =
        String(name).trim();

      if (!normalizedName) {
        return sendResponse(
          res,
          400,
          "Name cannot be empty"
        );
      }

      const nameParts =
        normalizedName.split(/\s+/);

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

    if (phone !== undefined) {
      const normalizedPhone =
        String(phone).trim();

      const user =
        await User.findById(userId);

      if (user) {
        user.phone =
          normalizedPhone;

        await user.save();
      }
    }

    /*
    --------------------------------------------------------
    UPDATE USER EMAIL
    --------------------------------------------------------
    */

    if (email !== undefined) {
      const normalizedEmail =
        String(email).trim().toLowerCase();

      const user =
        await User.findById(userId);

      if (user) {
        /*
        Only update User.email if your application
        allows users to change their email here.
        Otherwise applicationEmail remains separate.
        */
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
    GET UPDATED APPLICATION
    --------------------------------------------------------
    */

    const updatedApplication =
      await populateApplication(
        Instructor.findById(
          application._id
        )
      );

    /*
    --------------------------------------------------------
    RESPONSE
    --------------------------------------------------------
    */

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
============================================================

DELETE /api/instructor/applications/:id
============================================================
*/

export const withdrawInstructorApplication =
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const { id } = req.params;

    /*
    --------------------------------------------------------
    AUTHENTICATION
    --------------------------------------------------------
    */

    if (!userId) {
      return sendResponse(
        res,
        401,
        "Authentication required"
      );
    }

    /*
    --------------------------------------------------------
    VALIDATE ID
    --------------------------------------------------------
    */

    if (!isValidObjectId(id)) {
      return sendResponse(
        res,
        400,
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

    /*
    --------------------------------------------------------
    RESPONSE
    --------------------------------------------------------
    */

    return sendResponse(
      res,
      200,
      "Instructor application withdrawn successfully"
    );
  });
  