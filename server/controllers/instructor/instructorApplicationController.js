import User from "../../models/user/User.js";
import Instructor from "../../models/user/Instructor.js";

import asyncHandler from "../../middlewares/error/asyncHandler.js";
import sendResponse from "../../utils/sendResponse.js";


// ============================================================
// HELPERS
// ============================================================

const splitFullName = (fullName = "") => {
  const parts = String(fullName)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: "",
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};


const getApplicationUserId = (req) => {
  return req.user?._id || req.user?.id;
};


// ============================================================
// SUBMIT INSTRUCTOR APPLICATION
// POST /api/instructor/applications
// ============================================================

export const submitInstructorApplication = asyncHandler(
  async (req, res) => {
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


    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (
      !name ||
      !email ||
      !phone ||
      !expertise ||
      !experience ||
      !teachingExperience ||
      !course ||
      !availability ||
      !coverLetter
    ) {
      return sendResponse(
        res,
        400,
        "Please complete all required instructor application fields."
      );
    }


    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();


    // --------------------------------------------------------
    // CHECK EXISTING USER
    // --------------------------------------------------------

    let user = null;

    const authenticatedUserId = getApplicationUserId(req);

    if (authenticatedUserId) {
      user = await User.findById(authenticatedUserId);
    }


    // --------------------------------------------------------
    // IF NOT AUTHENTICATED, FIND USER BY EMAIL
    // --------------------------------------------------------

    if (!user) {
      user = await User.findOne({
        email: normalizedEmail,
      });
    }


    // --------------------------------------------------------
    // APPLICATION REQUIRES AN ACCOUNT
    // --------------------------------------------------------

    if (!user) {
      return sendResponse(
        res,
        401,
        "Please create an account or log in before applying to become an instructor."
      );
    }


    // --------------------------------------------------------
    // EMAIL MUST MATCH ACCOUNT
    // --------------------------------------------------------

    if (
      user.email &&
      user.email.toLowerCase() !== normalizedEmail
    ) {
      return sendResponse(
        res,
        400,
        "The application email must match your account email."
      );
    }


    // --------------------------------------------------------
    // CHECK EXISTING APPLICATION
    // --------------------------------------------------------

    const existingApplication =
      await Instructor.findOne({
        user: user._id,
      });


    if (existingApplication) {
      if (
        existingApplication.applicationStatus ===
        "pending"
      ) {
        return sendResponse(
          res,
          409,
          "You already have a pending instructor application."
        );
      }


      if (
        existingApplication.applicationStatus ===
        "approved"
      ) {
        return sendResponse(
          res,
          409,
          "Your instructor application has already been approved."
        );
      }


      // ------------------------------------------------------
      // REJECTED APPLICATION
      //
      // Allow the applicant to reapply by updating the
      // existing application instead of creating duplicates.
      // ------------------------------------------------------

      if (
        existingApplication.applicationStatus ===
        "rejected"
      ) {
        const nameParts = splitFullName(name);

        user.firstName = nameParts.firstName;

        if (nameParts.lastName) {
          user.lastName = nameParts.lastName;
        }

        if (phone) {
          user.phone = phone;
        }

        await user.save();


        existingApplication.expertise = expertise;
        existingApplication.experience = experience;
        existingApplication.portfolio =
          portfolio || "";
        existingApplication.teachingExperience =
          teachingExperience;
        existingApplication.course = course;
        existingApplication.availability =
          availability;
        existingApplication.coverLetter =
          coverLetter;

        if (req.file) {
          existingApplication.cv = {
            url:
              req.file.path ||
              req.file.secure_url ||
              req.file.url,
            publicId:
              req.file.filename ||
              req.file.public_id ||
              null,
            originalName:
              req.file.originalname ||
              null,
          };
        }

        existingApplication.applicationStatus =
          "pending";

        existingApplication.rejectionReason = undefined;
        existingApplication.approvedBy = undefined;
        existingApplication.approvedAt = undefined;

        await existingApplication.save();

        const populatedApplication =
          await Instructor.findById(
            existingApplication._id
          ).populate(
            "user",
            "firstName lastName email phone"
          );

        return sendResponse(
          res,
          200,
          "Instructor application resubmitted successfully.",
          populatedApplication
        );
      }
    }


    // --------------------------------------------------------
    // UPDATE USER PROFILE INFORMATION
    // --------------------------------------------------------

    const nameParts = splitFullName(name);

    if (nameParts.firstName) {
      user.firstName = nameParts.firstName;
    }

    if (nameParts.lastName) {
      user.lastName = nameParts.lastName;
    }

    if (phone) {
      user.phone = phone;
    }

    await user.save();


    // --------------------------------------------------------
    // CREATE APPLICATION
    // --------------------------------------------------------

    const applicationData = {
      user: user._id,

      expertise,
      experience,

      portfolio:
        portfolio || "",

      teachingExperience,

      course,

      availability,

      coverLetter,

      applicationStatus: "pending",
    };


    // --------------------------------------------------------
    // CV
    // --------------------------------------------------------

    if (req.file) {
      applicationData.cv = {
        url:
          req.file.path ||
          req.file.secure_url ||
          req.file.url,

        publicId:
          req.file.filename ||
          req.file.public_id ||
          null,

        originalName:
          req.file.originalname ||
          null,
      };
    }


    const instructor =
      await Instructor.create(
        applicationData
      );


    const populatedInstructor =
      await Instructor.findById(
        instructor._id
      ).populate(
        "user",
        "firstName lastName email phone"
      );


    return sendResponse(
      res,
      201,
      "Instructor application submitted successfully.",
      populatedInstructor
    );
  }
);


// ============================================================
// GET MY INSTRUCTOR APPLICATION
// GET /api/instructor/applications/me
// ============================================================

export const getMyInstructorApplication =
  asyncHandler(async (req, res) => {
    const userId = getApplicationUserId(req);

    if (!userId) {
      return sendResponse(
        res,
        401,
        "Authentication required."
      );
    }


    const instructor =
      await Instructor.findOne({
        user: userId,
      }).populate(
        "user",
        "firstName lastName email phone"
      );


    if (!instructor) {
      return sendResponse(
        res,
        404,
        "You do not have an instructor application."
      );
    }


    return sendResponse(
      res,
      200,
      "Instructor application retrieved.",
      instructor
    );
  });


// ============================================================
// GET MY SPECIFIC APPLICATION
// GET /api/instructor/applications/:id
// ============================================================

export const getInstructorApplication =
  asyncHandler(async (req, res) => {
    const userId = getApplicationUserId(req);

    if (!userId) {
      return sendResponse(
        res,
        401,
        "Authentication required."
      );
    }


    const instructor =
      await Instructor.findOne({
        _id: req.params.id,
        user: userId,
      }).populate(
        "user",
        "firstName lastName email phone"
      );


    if (!instructor) {
      return sendResponse(
        res,
        404,
        "Instructor application not found."
      );
    }


    return sendResponse(
      res,
      200,
      "Instructor application retrieved.",
      instructor
    );
  });


// ============================================================
// UPDATE MY APPLICATION
// PUT /api/instructor/applications/:id
// ============================================================

export const updateInstructorApplication =
  asyncHandler(async (req, res) => {
    const userId = getApplicationUserId(req);

    if (!userId) {
      return sendResponse(
        res,
        401,
        "Authentication required."
      );
    }


    const instructor =
      await Instructor.findOne({
        _id: req.params.id,
        user: userId,
      });


    if (!instructor) {
      return sendResponse(
        res,
        404,
        "Instructor application not found."
      );
    }


    // --------------------------------------------------------
    // DO NOT ALLOW EDITING AN APPROVED APPLICATION
    // --------------------------------------------------------

    if (
      instructor.applicationStatus ===
      "approved"
    ) {
      return sendResponse(
        res,
        400,
        "Approved instructor applications cannot be edited."
      );
    }


    // --------------------------------------------------------
    // UPDATE APPLICATION FIELDS
    // --------------------------------------------------------

    const allowedFields = [
      "expertise",
      "experience",
      "portfolio",
      "teachingExperience",
      "course",
      "availability",
      "coverLetter",
    ];


    for (const field of allowedFields) {
      if (
        req.body[field] !== undefined
      ) {
        instructor[field] =
          req.body[field];
      }
    }


    // --------------------------------------------------------
    // UPDATE USER INFORMATION
    // --------------------------------------------------------

    const user =
      await User.findById(userId);


    if (!user) {
      return sendResponse(
        res,
        404,
        "User account not found."
      );
    }


    if (req.body.name) {
      const nameParts =
        splitFullName(
          req.body.name
        );

      if (nameParts.firstName) {
        user.firstName =
          nameParts.firstName;
      }

      if (nameParts.lastName) {
        user.lastName =
          nameParts.lastName;
      }
    }


    if (req.body.phone) {
      user.phone =
        req.body.phone;
    }


    // --------------------------------------------------------
    // CV REPLACEMENT
    // --------------------------------------------------------

    if (req.file) {
      instructor.cv = {
        url:
          req.file.path ||
          req.file.secure_url ||
          req.file.url,

        publicId:
          req.file.filename ||
          req.file.public_id ||
          null,

        originalName:
          req.file.originalname ||
          null,
      };
    }


    // --------------------------------------------------------
    // IF PREVIOUSLY REJECTED, EDITING REOPENS APPLICATION
    // --------------------------------------------------------

    if (
      instructor.applicationStatus ===
      "rejected"
    ) {
      instructor.applicationStatus =
        "pending";

      instructor.rejectionReason =
        undefined;

      instructor.approvedBy =
        undefined;

      instructor.approvedAt =
        undefined;
    }


    await user.save();
    await instructor.save();


    const populatedInstructor =
      await Instructor.findById(
        instructor._id
      ).populate(
        "user",
        "firstName lastName email phone"
      );


    return sendResponse(
      res,
      200,
      "Instructor application updated successfully.",
      populatedInstructor
    );
  });


// ============================================================
// WITHDRAW MY APPLICATION
// DELETE /api/instructor/applications/:id
// ============================================================

export const withdrawInstructorApplication =
  asyncHandler(async (req, res) => {
    const userId = getApplicationUserId(req);

    if (!userId) {
      return sendResponse(
        res,
        401,
        "Authentication required."
      );
    }


    const instructor =
      await Instructor.findOne({
        _id: req.params.id,
        user: userId,
      });


    if (!instructor) {
      return sendResponse(
        res,
        404,
        "Instructor application not found."
      );
    }


    // --------------------------------------------------------
    // APPROVED APPLICATION CANNOT BE WITHDRAWN HERE
    // --------------------------------------------------------

    if (
      instructor.applicationStatus ===
      "approved"
    ) {
      return sendResponse(
        res,
        400,
        "An approved instructor profile cannot be withdrawn."
      );
    }


    await Instructor.findByIdAndDelete(
      instructor._id
    );


    return sendResponse(
      res,
      200,
      "Instructor application withdrawn successfully."
    );
  });
  