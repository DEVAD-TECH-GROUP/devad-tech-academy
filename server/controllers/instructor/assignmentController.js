import mongoose from "mongoose";

import Assignment from "../../models/assessment/Assignment.js";
import Submission from "../../models/assessment/Submission.js";
import Course from "../../models/course/Course.js";

import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

import {
  createAssignmentValidator,
} from "../../validators/instructor/assignmentValidator.js";


// ============================================================
// GET MY ASSIGNMENTS
// ============================================================

export const getMyAssignments = asyncHandler(async (req, res) => {
  const result = await paginate(
    Assignment,
    { instructor: req.user._id },
    {
      page: req.query.page,
      limit: req.query.limit,
      populate: "course",
    }
  );

  return sendResponse(
    res,
    200,
    "Assignments retrieved successfully",
    result
  );
});


// ============================================================
// CREATE ASSIGNMENT
// ============================================================

export const createAssignment = asyncHandler(async (req, res) => {
  const { error, value } = createAssignmentValidator(req.body);

  if (error) {
    return sendResponse(
      res,
      400,
      error.details[0].message
    );
  }

  const {
    course,
    title,
    description,
    instructions,
    attachments,
    dueDate,
    totalPoints,
    passingPoints,
    rubric,
    allowLateSubmission,
    latePenaltyPercent,
    maxFileSize,
    allowedFileTypes,
    isPublished,
  } = value;

  // ----------------------------------------------------------
  // Validate course ID
  // ----------------------------------------------------------

  if (!course || !mongoose.Types.ObjectId.isValid(course)) {
    return sendResponse(
      res,
      400,
      "A valid course is required"
    );
  }

  // ----------------------------------------------------------
  // Find course
  // ----------------------------------------------------------

  const courseDoc = await Course.findById(course);

  if (!courseDoc) {
    return sendResponse(
      res,
      404,
      "Course not found"
    );
  }

  // ----------------------------------------------------------
  // Verify course ownership
  // ----------------------------------------------------------

  if (courseDoc.instructor.toString() !== req.user._id.toString()) {
    return sendResponse(
      res,
      403,
      "You are not authorized to create an assignment for this course"
    );
  }

  // ----------------------------------------------------------
  // Validate passing points
  // ----------------------------------------------------------

  if (passingPoints > totalPoints) {
    return sendResponse(
      res,
      400,
      "Passing points cannot exceed total points"
    );
  }

  // ----------------------------------------------------------
  // Validate rubric total
  // ----------------------------------------------------------

  if (Array.isArray(rubric) && rubric.length > 0) {
    const rubricTotal = rubric.reduce(
      (sum, item) => sum + Number(item.points || 0),
      0
    );

    if (rubricTotal > totalPoints) {
      return sendResponse(
        res,
        400,
        "The total rubric points cannot exceed the assignment total points"
      );
    }
  }

  // ----------------------------------------------------------
  // Create assignment
  // ----------------------------------------------------------

  const assignment = await Assignment.create({
    course: courseDoc._id,
    instructor: courseDoc.instructor,
    title,
    description,
    instructions: instructions || null,
    attachments: attachments || [],
    dueDate,
    totalPoints,
    passingPoints,
    rubric: rubric || [],
    allowLateSubmission: allowLateSubmission ?? false,
    latePenaltyPercent: latePenaltyPercent ?? 0,
    maxFileSize: maxFileSize ?? 50,
    allowedFileTypes: allowedFileTypes || [],
    isPublished: isPublished ?? false,
  });

  // ----------------------------------------------------------
  // Update course statistics
  // ----------------------------------------------------------

  await Course.findByIdAndUpdate(
    courseDoc._id,
    {
      $inc: {
        totalAssignments: 1,
      },
    }
  );

  return sendResponse(
    res,
    201,
    "Assignment created successfully",
    assignment
  );
});


// ============================================================
// GET SINGLE ASSIGNMENT
// ============================================================

export const getAssignment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendResponse(
      res,
      400,
      "Invalid assignment ID"
    );
  }

  const assignment = await Assignment.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  })
    .populate("course", "title slug instructor");

  if (!assignment) {
    return sendResponse(
      res,
      404,
      "Assignment not found"
    );
  }

  return sendResponse(
    res,
    200,
    "Assignment retrieved successfully",
    assignment
  );
});


// ============================================================
// UPDATE ASSIGNMENT
// ============================================================

export const updateAssignment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendResponse(
      res,
      400,
      "Invalid assignment ID"
    );
  }

  const assignment = await Assignment.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  });

  if (!assignment) {
    return sendResponse(
      res,
      404,
      "Assignment not found"
    );
  }

  // ----------------------------------------------------------
  // Prevent changing ownership
  // ----------------------------------------------------------

  if (req.body.course) {
    if (!mongoose.Types.ObjectId.isValid(req.body.course)) {
      return sendResponse(
        res,
        400,
        "Invalid course ID"
      );
    }

    const course = await Course.findById(req.body.course);

    if (!course) {
      return sendResponse(
        res,
        404,
        "Course not found"
      );
    }

    if (
      course.instructor.toString() !==
      req.user._id.toString()
    ) {
      return sendResponse(
        res,
        403,
        "You are not authorized to move this assignment to that course"
      );
    }

    assignment.course = course._id;
    assignment.instructor = course.instructor;
  }

  // ----------------------------------------------------------
  // Update allowed fields
  // ----------------------------------------------------------

  const allowedFields = [
    "title",
    "description",
    "instructions",
    "attachments",
    "dueDate",
    "totalPoints",
    "passingPoints",
    "rubric",
    "allowLateSubmission",
    "latePenaltyPercent",
    "maxFileSize",
    "allowedFileTypes",
    "isPublished",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      assignment[field] = req.body[field];
    }
  }

  // ----------------------------------------------------------
  // Validate points
  // ----------------------------------------------------------

  if (assignment.passingPoints > assignment.totalPoints) {
    return sendResponse(
      res,
      400,
      "Passing points cannot exceed total points"
    );
  }

  // ----------------------------------------------------------
  // Validate rubric
  // ----------------------------------------------------------

  if (
    Array.isArray(assignment.rubric) &&
    assignment.rubric.length > 0
  ) {
    const rubricTotal = assignment.rubric.reduce(
      (sum, item) => sum + Number(item.points || 0),
      0
    );

    if (rubricTotal > assignment.totalPoints) {
      return sendResponse(
        res,
        400,
        "The total rubric points cannot exceed the assignment total points"
      );
    }
  }

  await assignment.save();

  return sendResponse(
    res,
    200,
    "Assignment updated successfully",
    assignment
  );
});


// ============================================================
// DELETE ASSIGNMENT
// ============================================================

export const deleteAssignment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendResponse(
      res,
      400,
      "Invalid assignment ID"
    );
  }

  const assignment = await Assignment.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  });

  if (!assignment) {
    return sendResponse(
      res,
      404,
      "Assignment not found"
    );
  }

  // ----------------------------------------------------------
  // Prevent deletion when submissions exist
  // ----------------------------------------------------------

  const submissionCount = await Submission.countDocuments({
    assignment: assignment._id,
  });

  if (submissionCount > 0) {
    return sendResponse(
      res,
      400,
      "This assignment cannot be deleted because students have already submitted work"
    );
  }

  const courseId = assignment.course;

  await assignment.deleteOne();

  // ----------------------------------------------------------
  // Update course statistics
  // ----------------------------------------------------------

  await Course.findByIdAndUpdate(
    courseId,
    {
      $inc: {
        totalAssignments: -1,
      },
    }
  );

  // Safety correction
  await Course.findByIdAndUpdate(
    courseId,
    {
      $max: {
        totalAssignments: 0,
      },
    }
  );

  return sendResponse(
    res,
    200,
    "Assignment deleted successfully"
  );
});


// ============================================================
// GET ASSIGNMENT SUBMISSIONS
// ============================================================

export const getSubmissions = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendResponse(
      res,
      400,
      "Invalid assignment ID"
    );
  }

  // ----------------------------------------------------------
  // Verify assignment ownership
  // ----------------------------------------------------------

  const assignment = await Assignment.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  });

  if (!assignment) {
    return sendResponse(
      res,
      404,
      "Assignment not found"
    );
  }

  const submissions = await Submission.find({
    assignment: assignment._id,
  })
    .populate(
      "student",
      "firstName lastName email avatar"
    )
    .populate(
      "course",
      "title slug"
    )
    .sort({
      submittedAt: -1,
    });

  return sendResponse(
    res,
    200,
    "Submissions retrieved successfully",
    submissions
  );
});


// ============================================================
// GRADE SUBMISSION
// ============================================================

export const gradeSubmission = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendResponse(
      res,
      400,
      "Invalid submission ID"
    );
  }

  const {
    grade,
    feedback,
    rubricGrades,
  } = req.body;

  // ----------------------------------------------------------
  // Validate grade
  // ----------------------------------------------------------

  if (
    grade === undefined ||
    grade === null ||
    Number.isNaN(Number(grade))
  ) {
    return sendResponse(
      res,
      400,
      "A valid grade is required"
    );
  }

  // ----------------------------------------------------------
  // Find submission
  // ----------------------------------------------------------

  const submission = await Submission.findById(
    req.params.id
  );

  if (!submission) {
    return sendResponse(
      res,
      404,
      "Submission not found"
    );
  }

  // ----------------------------------------------------------
  // Find assignment and verify ownership
  // ----------------------------------------------------------

  const assignment = await Assignment.findOne({
    _id: submission.assignment,
    instructor: req.user._id,
  });

  if (!assignment) {
    return sendResponse(
      res,
      403,
      "You are not authorized to grade this submission"
    );
  }

  // ----------------------------------------------------------
  // Validate grade range
  // ----------------------------------------------------------

  const numericGrade = Number(grade);

  if (
    numericGrade < 0 ||
    numericGrade > assignment.totalPoints
  ) {
    return sendResponse(
      res,
      400,
      `Grade must be between 0 and ${assignment.totalPoints}`
    );
  }

  // ----------------------------------------------------------
  // Validate rubric grades
  // ----------------------------------------------------------

  if (Array.isArray(rubricGrades)) {
    const rubricTotal = rubricGrades.reduce(
      (sum, item) =>
        sum + Number(item.pointsEarned || 0),
      0
    );

    if (rubricTotal > assignment.totalPoints) {
      return sendResponse(
        res,
        400,
        "Rubric grades cannot exceed the assignment total points"
      );
    }
  }

  // ----------------------------------------------------------
  // Track whether this was already graded
  // ----------------------------------------------------------

  const wasAlreadyGraded =
    submission.status === "graded";

  // ----------------------------------------------------------
  // Update submission
  // ----------------------------------------------------------

  submission.grade = numericGrade;
  submission.feedback = feedback || null;
  submission.rubricGrades = rubricGrades || [];
  submission.status = "graded";
  submission.gradedBy = req.user._id;
  submission.gradedAt = new Date();

  await submission.save();

  // ----------------------------------------------------------
  // Update assignment statistics
  // ----------------------------------------------------------

  if (!wasAlreadyGraded) {
    await Assignment.findByIdAndUpdate(
      assignment._id,
      {
        $inc: {
          totalGraded: 1,
        },
      }
    );
  }

  // ----------------------------------------------------------
  // Recalculate average grade
  // ----------------------------------------------------------

  const gradeStats = await Submission.aggregate([
    {
      $match: {
        assignment: assignment._id,
        status: "graded",
        grade: {
          $ne: null,
        },
      },
    },
    {
      $group: {
        _id: null,
        averageGrade: {
          $avg: "$grade",
        },
      },
    },
  ]);

  const averageGrade =
    gradeStats.length > 0
      ? Number(
          gradeStats[0].averageGrade.toFixed(2)
        )
      : 0;

  await Assignment.findByIdAndUpdate(
    assignment._id,
    {
      averageGrade,
    }
  );

  return sendResponse(
    res,
    200,
    "Submission graded successfully",
    submission
  );
});