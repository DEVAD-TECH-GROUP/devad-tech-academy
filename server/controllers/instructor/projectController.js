import mongoose from "mongoose";

import Project from "../../models/assessment/Project.js";
import ProjectSubmission from "../../models/assessment/ProjectSubmission.js";
import Course from "../../models/course/Course.js";

import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

// ============================================================
// GET MY PROJECTS
// ============================================================

export const getMyProjects = asyncHandler(async (req, res) => {
  const { page, limit, course, search, isPublished, isCapstone } =
    req.query;

  const query = {
    instructor: req.user._id,
  };

  if (course) {
    if (!mongoose.Types.ObjectId.isValid(course)) {
      return sendResponse(res, 400, "Invalid course ID");
    }

    query.course = course;
  }

  if (search && search.trim()) {
    query.title = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  if (isPublished !== undefined) {
    query.isPublished =
      isPublished === "true";
  }

  if (isCapstone !== undefined) {
    query.isCapstone =
      isCapstone === "true";
  }

  const result = await paginate(
    Project,
    query,
    {
      page,
      limit,
      populate: "course",
      sort: {
        createdAt: -1,
      },
    }
  );

  return sendResponse(
    res,
    200,
    "Projects retrieved successfully",
    result
  );
});

// ============================================================
// CREATE PROJECT
// ============================================================

export const createProject = asyncHandler(async (req, res) => {
  const {
    course,
    title,
    description,
    requirements,
    type,
    maxTeamSize,
    attachments,
    dueDate,
    totalPoints,
    passingPoints,
    rubric,
    isCapstone,
    isPublished,
  } = req.body;

  // ----------------------------------------------------------
  // Validate course
  // ----------------------------------------------------------

  if (!course) {
    return sendResponse(
      res,
      400,
      "Course is required"
    );
  }

  if (!mongoose.Types.ObjectId.isValid(course)) {
    return sendResponse(
      res,
      400,
      "Invalid course ID"
    );
  }

  // ----------------------------------------------------------
  // Verify instructor owns course
  // ----------------------------------------------------------

  const courseDocument = await Course.findOne({
    _id: course,
    instructor: req.user._id,
  });

  if (!courseDocument) {
    return sendResponse(
      res,
      404,
      "Course not found or you do not own this course"
    );
  }

  // ----------------------------------------------------------
  // Validate basic fields
  // ----------------------------------------------------------

  if (!title || !title.trim()) {
    return sendResponse(
      res,
      400,
      "Project title is required"
    );
  }

  if (!description || !description.trim()) {
    return sendResponse(
      res,
      400,
      "Project description is required"
    );
  }

  // ----------------------------------------------------------
  // Validate project type
  // ----------------------------------------------------------

  const projectType =
    type || "individual";

  if (
    !["individual", "team"].includes(
      projectType
    )
  ) {
    return sendResponse(
      res,
      400,
      "Project type must be individual or team"
    );
  }

  // ----------------------------------------------------------
  // Validate team size
  // ----------------------------------------------------------

  let parsedMaxTeamSize =
    maxTeamSize !== undefined
      ? Number(maxTeamSize)
      : projectType === "individual"
      ? 1
      : 2;

  if (
    !Number.isInteger(parsedMaxTeamSize) ||
    parsedMaxTeamSize < 1
  ) {
    return sendResponse(
      res,
      400,
      "Maximum team size must be a positive integer"
    );
  }

  if (
    projectType === "individual" &&
    parsedMaxTeamSize !== 1
  ) {
    return sendResponse(
      res,
      400,
      "Individual projects must have a maximum team size of 1"
    );
  }

  // ----------------------------------------------------------
  // Validate due date
  // ----------------------------------------------------------

  if (!dueDate) {
    return sendResponse(
      res,
      400,
      "Due date is required"
    );
  }

  const parsedDueDate =
    new Date(dueDate);

  if (
    Number.isNaN(
      parsedDueDate.getTime()
    )
  ) {
    return sendResponse(
      res,
      400,
      "Invalid due date"
    );
  }

  // ----------------------------------------------------------
  // Validate points
  // ----------------------------------------------------------

  const parsedTotalPoints =
    totalPoints !== undefined
      ? Number(totalPoints)
      : 100;

  const parsedPassingPoints =
    passingPoints !== undefined
      ? Number(passingPoints)
      : 50;

  if (
    !Number.isFinite(parsedTotalPoints) ||
    parsedTotalPoints <= 0
  ) {
    return sendResponse(
      res,
      400,
      "Total points must be greater than 0"
    );
  }

  if (
    !Number.isFinite(parsedPassingPoints) ||
    parsedPassingPoints < 0 ||
    parsedPassingPoints > parsedTotalPoints
  ) {
    return sendResponse(
      res,
      400,
      "Passing points must be between 0 and total points"
    );
  }

  // ----------------------------------------------------------
  // Create project
  // ----------------------------------------------------------

  const project = await Project.create({
    course: courseDocument._id,
    instructor: req.user._id,

    title: title.trim(),
    description: description.trim(),

    requirements:
      Array.isArray(requirements)
        ? requirements
        : [],

    type: projectType,

    maxTeamSize:
      projectType === "individual"
        ? 1
        : parsedMaxTeamSize,

    attachments:
      Array.isArray(attachments)
        ? attachments
        : [],

    dueDate: parsedDueDate,

    totalPoints: parsedTotalPoints,

    passingPoints:
      parsedPassingPoints,

    rubric:
      Array.isArray(rubric)
        ? rubric
        : [],

    isCapstone:
      Boolean(isCapstone),

    isPublished:
      Boolean(isPublished),
  });

  const populatedProject =
    await Project.findById(
      project._id
    ).populate(
      "course",
      "title slug"
    );

  return sendResponse(
    res,
    201,
    "Project created successfully",
    populatedProject
  );
});

// ============================================================
// GET SINGLE PROJECT
// ============================================================

export const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(
      res,
      400,
      "Invalid project ID"
    );
  }

  const project =
    await Project.findOne({
      _id: id,
      instructor: req.user._id,
    }).populate(
      "course",
      "title slug"
    );

  if (!project) {
    return sendResponse(
      res,
      404,
      "Project not found"
    );
  }

  return sendResponse(
    res,
    200,
    "Project retrieved successfully",
    project
  );
});

// ============================================================
// UPDATE PROJECT
// ============================================================

export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(
      res,
      400,
      "Invalid project ID"
    );
  }

  const project =
    await Project.findOne({
      _id: id,
      instructor: req.user._id,
    });

  if (!project) {
    return sendResponse(
      res,
      404,
      "Project not found"
    );
  }

  const {
    course,
    title,
    description,
    requirements,
    type,
    maxTeamSize,
    attachments,
    dueDate,
    totalPoints,
    passingPoints,
    rubric,
    isCapstone,
    isPublished,
  } = req.body;

  // ----------------------------------------------------------
  // Course change
  // ----------------------------------------------------------

  if (
    course !== undefined &&
    String(course) !==
      String(project.course)
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(
        course
      )
    ) {
      return sendResponse(
        res,
        400,
        "Invalid course ID"
      );
    }

    const newCourse =
      await Course.findOne({
        _id: course,
        instructor: req.user._id,
      });

    if (!newCourse) {
      return sendResponse(
        res,
        404,
        "Course not found or you do not own this course"
      );
    }

    project.course =
      newCourse._id;
  }

  // ----------------------------------------------------------
  // Basic fields
  // ----------------------------------------------------------

  if (title !== undefined) {
    if (!title.trim()) {
      return sendResponse(
        res,
        400,
        "Project title cannot be empty"
      );
    }

    project.title =
      title.trim();
  }

  if (description !== undefined) {
    if (!description.trim()) {
      return sendResponse(
        res,
        400,
        "Project description cannot be empty"
      );
    }

    project.description =
      description.trim();
  }

  if (requirements !== undefined) {
    if (!Array.isArray(requirements)) {
      return sendResponse(
        res,
        400,
        "Requirements must be an array"
      );
    }

    project.requirements =
      requirements;
  }

  // ----------------------------------------------------------
  // Project type
  // ----------------------------------------------------------

  if (type !== undefined) {
    if (
      !["individual", "team"].includes(
        type
      )
    ) {
      return sendResponse(
        res,
        400,
        "Project type must be individual or team"
      );
    }

    project.type = type;

    if (type === "individual") {
      project.maxTeamSize = 1;
    }
  }

  // ----------------------------------------------------------
  // Team size
  // ----------------------------------------------------------

  if (
    maxTeamSize !== undefined ||
    type === "team"
  ) {
    const newType =
      type !== undefined
        ? type
        : project.type;

    if (newType === "individual") {
      project.maxTeamSize = 1;
    } else {
      const parsedMaxTeamSize =
        Number(
          maxTeamSize !== undefined
            ? maxTeamSize
            : project.maxTeamSize
        );

      if (
        !Number.isInteger(
          parsedMaxTeamSize
        ) ||
        parsedMaxTeamSize < 1
      ) {
        return sendResponse(
          res,
          400,
          "Maximum team size must be a positive integer"
        );
      }

      project.maxTeamSize =
        parsedMaxTeamSize;
    }
  }

  // ----------------------------------------------------------
  // Attachments
  // ----------------------------------------------------------

  if (attachments !== undefined) {
    if (!Array.isArray(attachments)) {
      return sendResponse(
        res,
        400,
        "Attachments must be an array"
      );
    }

    project.attachments =
      attachments;
  }

  // ----------------------------------------------------------
  // Due date
  // ----------------------------------------------------------

  if (dueDate !== undefined) {
    const parsedDueDate =
      new Date(dueDate);

    if (
      Number.isNaN(
        parsedDueDate.getTime()
      )
    ) {
      return sendResponse(
        res,
        400,
        "Invalid due date"
      );
    }

    project.dueDate =
      parsedDueDate;
  }

  // ----------------------------------------------------------
  // Points
  // ----------------------------------------------------------

  if (totalPoints !== undefined) {
    const parsedTotalPoints =
      Number(totalPoints);

    if (
      !Number.isFinite(
        parsedTotalPoints
      ) ||
      parsedTotalPoints <= 0
    ) {
      return sendResponse(
        res,
        400,
        "Total points must be greater than 0"
      );
    }

    project.totalPoints =
      parsedTotalPoints;
  }

  if (passingPoints !== undefined) {
    const parsedPassingPoints =
      Number(passingPoints);

    if (
      !Number.isFinite(
        parsedPassingPoints
      ) ||
      parsedPassingPoints < 0
    ) {
      return sendResponse(
        res,
        400,
        "Passing points cannot be negative"
      );
    }

    project.passingPoints =
      parsedPassingPoints;
  }

  if (
    project.passingPoints >
    project.totalPoints
  ) {
    return sendResponse(
      res,
      400,
      "Passing points cannot exceed total points"
    );
  }

  // ----------------------------------------------------------
  // Rubric
  // ----------------------------------------------------------

  if (rubric !== undefined) {
    if (!Array.isArray(rubric)) {
      return sendResponse(
        res,
        400,
        "Rubric must be an array"
      );
    }

    let rubricTotal = 0;

    for (const item of rubric) {
      if (
        !item.criterion ||
        !String(item.criterion).trim()
      ) {
        return sendResponse(
          res,
          400,
          "Every rubric item requires a criterion"
        );
      }

      const points =
        Number(item.points);

      if (
        !Number.isFinite(points) ||
        points < 0
      ) {
        return sendResponse(
          res,
          400,
          "Rubric points must be valid non-negative numbers"
        );
      }

      rubricTotal += points;
    }

    if (
      rubricTotal >
      project.totalPoints
    ) {
      return sendResponse(
        res,
        400,
        "Rubric points cannot exceed total project points"
      );
    }

    project.rubric = rubric;
  }

  // ----------------------------------------------------------
  // Remaining fields
  // ----------------------------------------------------------

  if (isCapstone !== undefined) {
    project.isCapstone =
      Boolean(isCapstone);
  }

  if (isPublished !== undefined) {
    project.isPublished =
      Boolean(isPublished);
  }

  await project.save();

  const updatedProject =
    await Project.findById(
      project._id
    ).populate(
      "course",
      "title slug"
    );

  return sendResponse(
    res,
    200,
    "Project updated successfully",
    updatedProject
  );
});

// ============================================================
// GET PROJECT SUBMISSIONS
// ============================================================

export const getProjectSubmissions = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(
        res,
        400,
        "Invalid project ID"
      );
    }

    const project =
      await Project.findOne({
        _id: id,
        instructor: req.user._id,
      });

    if (!project) {
      return sendResponse(
        res,
        404,
        "Project not found"
      );
    }

    const submissions =
      await ProjectSubmission.find({
        project: project._id,
      })
        .populate(
          "student",
          "firstName lastName email avatar"
        )
        .populate(
          "gradedBy",
          "firstName lastName email"
        )
        .sort({
          createdAt: -1,
        });

    return sendResponse(
      res,
      200,
      "Submissions retrieved successfully",
      submissions
    );
  }
);

// ============================================================
// GRADE PROJECT SUBMISSION
// ============================================================

export const gradeProjectSubmission = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(
        res,
        400,
        "Invalid submission ID"
      );
    }

    const {
      grade,
      letterGrade,
      feedback,
      rubricGrades,
    } = req.body;

    const submission =
      await ProjectSubmission.findById(
        id
      );

    if (!submission) {
      return sendResponse(
        res,
        404,
        "Submission not found"
      );
    }

    // --------------------------------------------------------
    // Verify project ownership
    // --------------------------------------------------------

    const project =
      await Project.findOne({
        _id: submission.project,
        instructor: req.user._id,
      });

    if (!project) {
      return sendResponse(
        res,
        403,
        "You are not authorized to grade this submission"
      );
    }

    // --------------------------------------------------------
    // Validate grade
    // --------------------------------------------------------

    let parsedGrade = grade;

    if (grade !== undefined && grade !== null) {
      parsedGrade =
        Number(grade);

      if (
        !Number.isFinite(parsedGrade) ||
        parsedGrade < 0 ||
        parsedGrade >
          project.totalPoints
      ) {
        return sendResponse(
          res,
          400,
          `Grade must be between 0 and ${project.totalPoints}`
        );
      }
    }

    // --------------------------------------------------------
    // Validate rubric grades
    // --------------------------------------------------------

    if (
      rubricGrades !== undefined
    ) {
      if (
        !Array.isArray(
          rubricGrades
        )
      ) {
        return sendResponse(
          res,
          400,
          "Rubric grades must be an array"
        );
      }

      for (const item of rubricGrades) {
        if (
          item.pointsEarned !==
          undefined
        ) {
          const pointsEarned =
            Number(
              item.pointsEarned
            );

          if (
            !Number.isFinite(
              pointsEarned
            ) ||
            pointsEarned < 0
          ) {
            return sendResponse(
              res,
              400,
              "Rubric points earned must be valid non-negative numbers"
            );
          }
        }
      }
    }

    // --------------------------------------------------------
    // Track whether this is the first grading
    // --------------------------------------------------------

    const wasAlreadyGraded =
      submission.status ===
      "graded";

    // --------------------------------------------------------
    // Update submission
    // --------------------------------------------------------

    submission.grade =
      parsedGrade;

    submission.letterGrade =
      letterGrade ?? null;

    submission.feedback =
      feedback ?? null;

    submission.rubricGrades =
      rubricGrades ?? [];

    submission.status =
      "graded";

    submission.gradedBy =
      req.user._id;

    submission.gradedAt =
      new Date();

    await submission.save();

    // --------------------------------------------------------
    // Update project statistics
    // --------------------------------------------------------

    if (!wasAlreadyGraded) {
      await Project.findByIdAndUpdate(
        project._id,
        {
          $inc: {
            totalGraded: 1,
          },
        }
      );
    }

    const updatedSubmission =
      await ProjectSubmission.findById(
        submission._id
      )
        .populate(
          "student",
          "firstName lastName email avatar"
        )
        .populate(
          "gradedBy",
          "firstName lastName email"
        )
        .populate(
          "project",
          "title totalPoints passingPoints"
        );

    return sendResponse(
      res,
      200,
      "Submission graded successfully",
      updatedSubmission
    );
  }
);

// ============================================================
// DELETE PROJECT
// ============================================================

export const deleteProject = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(
        res,
        400,
        "Invalid project ID"
      );
    }

    const project =
      await Project.findOne({
        _id: id,
        instructor: req.user._id,
      });

    if (!project) {
      return sendResponse(
        res,
        404,
        "Project not found"
      );
    }

    const submissionCount =
      await ProjectSubmission.countDocuments({
        project: project._id,
      });

    if (submissionCount > 0) {
      return sendResponse(
        res,
        400,
        "This project cannot be deleted because students have already submitted it"
      );
    }

    await Project.deleteOne({
      _id: project._id,
    });

    return sendResponse(
      res,
      200,
      "Project deleted successfully"
    );
  }
);