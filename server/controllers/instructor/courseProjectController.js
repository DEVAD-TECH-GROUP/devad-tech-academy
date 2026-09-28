import mongoose from "mongoose";

import Project from "../../models/course/Project.js";
import Course from "../../models/course/Course.js";

import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

// ============================================================
// GET MY COURSE PROJECTS
// ============================================================

export const getMyProjects = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    course,
    search,
    difficulty,
    isPublished,
  } = req.query;

  // ----------------------------------------------------------
  // Find courses owned by the instructor
  // ----------------------------------------------------------

  const courseQuery = {
    instructor: req.user._id,
  };

  if (course) {
    if (!mongoose.Types.ObjectId.isValid(course)) {
      return sendResponse(res, 400, "Invalid course ID");
    }

    courseQuery._id = course;
  }

  const ownedCourses = await Course.find(courseQuery)
    .select("_id")
    .lean();

  const courseIds = ownedCourses.map((item) => item._id);

  // ----------------------------------------------------------
  // If instructor has no courses
  // ----------------------------------------------------------

  if (courseIds.length === 0) {
    return sendResponse(res, 200, "Projects retrieved successfully", {
      data: [],
      total: 0,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      totalPages: 0,
    });
  }

  // ----------------------------------------------------------
  // Build project query
  // ----------------------------------------------------------

  const query = {
    course: {
      $in: courseIds,
    },
  };

  if (search && search.trim()) {
    query.$or = [
      {
        title: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        description: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  if (difficulty) {
    if (
      !["beginner", "intermediate", "advanced"].includes(
        difficulty
      )
    ) {
      return sendResponse(
        res,
        400,
        "Invalid difficulty"
      );
    }

    query.difficulty = difficulty;
  }

  if (isPublished !== undefined) {
    query.isPublished = isPublished === "true";
  }

  // ----------------------------------------------------------
  // Paginate
  // ----------------------------------------------------------

  const result = await paginate(Project, query, {
    page,
    limit,
    populate: {
      path: "course",
      select: "title slug instructor",
    },
    sort: {
      order: 1,
      createdAt: -1,
    },
  });

  return sendResponse(
    res,
    200,
    "Projects retrieved successfully",
    result
  );
});

// ============================================================
// CREATE COURSE PROJECT
// ============================================================

export const createProject = asyncHandler(async (req, res) => {
  const {
    course,
    title,
    description,
    objective,
    difficulty,
    estimatedHours,
    technologies,
    requirements,
    deliverables,
    githubUrl,
    liveDemoUrl,
    image,
    order,
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
  // Verify instructor owns the course
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
  // Validate title
  // ----------------------------------------------------------

  if (!title || !title.trim()) {
    return sendResponse(
      res,
      400,
      "Project title is required"
    );
  }

  // ----------------------------------------------------------
  // Validate description
  // ----------------------------------------------------------

  if (!description || !description.trim()) {
    return sendResponse(
      res,
      400,
      "Project description is required"
    );
  }

  // ----------------------------------------------------------
  // Validate difficulty
  // ----------------------------------------------------------

  const projectDifficulty =
    difficulty || "beginner";

  if (
    !["beginner", "intermediate", "advanced"].includes(
      projectDifficulty
    )
  ) {
    return sendResponse(
      res,
      400,
      "Difficulty must be beginner, intermediate, or advanced"
    );
  }

  // ----------------------------------------------------------
  // Validate estimated hours
  // ----------------------------------------------------------

  let parsedEstimatedHours = 0;

  if (estimatedHours !== undefined) {
    parsedEstimatedHours = Number(estimatedHours);

    if (
      !Number.isFinite(parsedEstimatedHours) ||
      parsedEstimatedHours < 0
    ) {
      return sendResponse(
        res,
        400,
        "Estimated hours must be a valid non-negative number"
      );
    }
  }

  // ----------------------------------------------------------
  // Validate order
  // ----------------------------------------------------------

  let parsedOrder = 0;

  if (order !== undefined) {
    parsedOrder = Number(order);

    if (
      !Number.isInteger(parsedOrder) ||
      parsedOrder < 0
    ) {
      return sendResponse(
        res,
        400,
        "Project order must be a non-negative integer"
      );
    }
  }

  // ----------------------------------------------------------
  // Validate arrays
  // ----------------------------------------------------------

  if (
    technologies !== undefined &&
    !Array.isArray(technologies)
  ) {
    return sendResponse(
      res,
      400,
      "Technologies must be an array"
    );
  }

  if (
    requirements !== undefined &&
    !Array.isArray(requirements)
  ) {
    return sendResponse(
      res,
      400,
      "Requirements must be an array"
    );
  }

  if (
    deliverables !== undefined &&
    !Array.isArray(deliverables)
  ) {
    return sendResponse(
      res,
      400,
      "Deliverables must be an array"
    );
  }

  // ----------------------------------------------------------
  // Validate URLs
  // ----------------------------------------------------------

  if (
    githubUrl !== undefined &&
    githubUrl !== null &&
    githubUrl !== ""
  ) {
    try {
      new URL(githubUrl);
    } catch {
      return sendResponse(
        res,
        400,
        "Invalid GitHub URL"
      );
    }
  }

  if (
    liveDemoUrl !== undefined &&
    liveDemoUrl !== null &&
    liveDemoUrl !== ""
  ) {
    try {
      new URL(liveDemoUrl);
    } catch {
      return sendResponse(
        res,
        400,
        "Invalid live demo URL"
      );
    }
  }

  // ----------------------------------------------------------
  // Validate image
  // ----------------------------------------------------------

  if (
    image !== undefined &&
    image !== null &&
    typeof image !== "object"
  ) {
    return sendResponse(
      res,
      400,
      "Image must be an object"
    );
  }

  // ----------------------------------------------------------
  // Create project
  // ----------------------------------------------------------

  const project = await Project.create({
    course: courseDocument._id,

    title: title.trim(),

    description: description.trim(),

    objective:
      objective !== undefined &&
      objective !== null &&
      String(objective).trim()
        ? String(objective).trim()
        : null,

    difficulty: projectDifficulty,

    estimatedHours:
      parsedEstimatedHours,

    technologies:
      Array.isArray(technologies)
        ? technologies
        : [],

    requirements:
      Array.isArray(requirements)
        ? requirements
        : [],

    deliverables:
      Array.isArray(deliverables)
        ? deliverables
        : [],

    githubUrl:
      githubUrl || null,

    liveDemoUrl:
      liveDemoUrl || null,

    image:
      image && typeof image === "object"
        ? {
            public_id:
              image.public_id || null,
            url:
              image.url || null,
          }
        : {
            public_id: null,
            url: null,
          },

    order: parsedOrder,

    isPublished:
      Boolean(isPublished),
  });

  // ----------------------------------------------------------
  // Update course statistics
  // ----------------------------------------------------------

  await Course.findByIdAndUpdate(
    courseDocument._id,
    {
      $inc: {
        totalProjects: 1,
      },
    }
  );

  // ----------------------------------------------------------
  // Return populated project
  // ----------------------------------------------------------

  const populatedProject =
    await Project.findById(project._id).populate(
      "course",
      "title slug instructor"
    );

  return sendResponse(
    res,
    201,
    "Course project created successfully",
    populatedProject
  );
});

// ============================================================
// GET SINGLE COURSE PROJECT
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

  // ----------------------------------------------------------
  // Find project and verify course ownership
  // ----------------------------------------------------------

  const project = await Project.findById(id).populate({
    path: "course",
    select: "title slug instructor",
  });

  if (!project) {
    return sendResponse(
      res,
      404,
      "Project not found"
    );
  }

  // ----------------------------------------------------------
  // Verify instructor owns project course
  // ----------------------------------------------------------

  if (
    String(project.course.instructor) !==
    String(req.user._id)
  ) {
    return sendResponse(
      res,
      403,
      "You are not authorized to access this project"
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
// UPDATE COURSE PROJECT
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

  // ----------------------------------------------------------
  // Find project
  // ----------------------------------------------------------

  const project = await Project.findById(id);

  if (!project) {
    return sendResponse(
      res,
      404,
      "Project not found"
    );
  }

  // ----------------------------------------------------------
  // Verify current course ownership
  // ----------------------------------------------------------

  const currentCourse =
    await Course.findOne({
      _id: project.course,
      instructor: req.user._id,
    });

  if (!currentCourse) {
    return sendResponse(
      res,
      403,
      "You are not authorized to update this project"
    );
  }

  const {
    course,
    title,
    description,
    objective,
    difficulty,
    estimatedHours,
    technologies,
    requirements,
    deliverables,
    githubUrl,
    liveDemoUrl,
    image,
    order,
    isPublished,
  } = req.body;

  let newCourse = currentCourse;

  // ----------------------------------------------------------
  // Course change
  // ----------------------------------------------------------

  if (
    course !== undefined &&
    String(course) !== String(project.course)
  ) {
    if (!mongoose.Types.ObjectId.isValid(course)) {
      return sendResponse(
        res,
        400,
        "Invalid course ID"
      );
    }

    newCourse = await Course.findOne({
      _id: course,
      instructor: req.user._id,
    });

    if (!newCourse) {
      return sendResponse(
        res,
        404,
        "New course not found or you do not own this course"
      );
    }

    project.course = newCourse._id;
  }

  // ----------------------------------------------------------
  // Title
  // ----------------------------------------------------------

  if (title !== undefined) {
    if (!title || !title.trim()) {
      return sendResponse(
        res,
        400,
        "Project title cannot be empty"
      );
    }

    project.title = title.trim();
  }

  // ----------------------------------------------------------
  // Description
  // ----------------------------------------------------------

  if (description !== undefined) {
    if (!description || !description.trim()) {
      return sendResponse(
        res,
        400,
        "Project description cannot be empty"
      );
    }

    project.description =
      description.trim();
  }

  // ----------------------------------------------------------
  // Objective
  // ----------------------------------------------------------

  if (objective !== undefined) {
    project.objective =
      objective === null ||
      String(objective).trim() === ""
        ? null
        : String(objective).trim();
  }

  // ----------------------------------------------------------
  // Difficulty
  // ----------------------------------------------------------

  if (difficulty !== undefined) {
    if (
      ![
        "beginner",
        "intermediate",
        "advanced",
      ].includes(difficulty)
    ) {
      return sendResponse(
        res,
        400,
        "Difficulty must be beginner, intermediate, or advanced"
      );
    }

    project.difficulty =
      difficulty;
  }

  // ----------------------------------------------------------
  // Estimated hours
  // ----------------------------------------------------------

  if (estimatedHours !== undefined) {
    const parsedEstimatedHours =
      Number(estimatedHours);

    if (
      !Number.isFinite(
        parsedEstimatedHours
      ) ||
      parsedEstimatedHours < 0
    ) {
      return sendResponse(
        res,
        400,
        "Estimated hours must be a valid non-negative number"
      );
    }

    project.estimatedHours =
      parsedEstimatedHours;
  }

  // ----------------------------------------------------------
  // Technologies
  // ----------------------------------------------------------

  if (technologies !== undefined) {
    if (!Array.isArray(technologies)) {
      return sendResponse(
        res,
        400,
        "Technologies must be an array"
      );
    }

    project.technologies =
      technologies;
  }

  // ----------------------------------------------------------
  // Requirements
  // ----------------------------------------------------------

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
  // Deliverables
  // ----------------------------------------------------------

  if (deliverables !== undefined) {
    if (!Array.isArray(deliverables)) {
      return sendResponse(
        res,
        400,
        "Deliverables must be an array"
      );
    }

    project.deliverables =
      deliverables;
  }

  // ----------------------------------------------------------
  // GitHub URL
  // ----------------------------------------------------------

  if (githubUrl !== undefined) {
    if (
      githubUrl !== null &&
      githubUrl !== ""
    ) {
      try {
        new URL(githubUrl);
      } catch {
        return sendResponse(
          res,
          400,
          "Invalid GitHub URL"
        );
      }
    }

    project.githubUrl =
      githubUrl || null;
  }

  // ----------------------------------------------------------
  // Live demo URL
  // ----------------------------------------------------------

  if (liveDemoUrl !== undefined) {
    if (
      liveDemoUrl !== null &&
      liveDemoUrl !== ""
    ) {
      try {
        new URL(liveDemoUrl);
      } catch {
        return sendResponse(
          res,
          400,
          "Invalid live demo URL"
        );
      }
    }

    project.liveDemoUrl =
      liveDemoUrl || null;
  }

  // ----------------------------------------------------------
  // Image
  // ----------------------------------------------------------

  if (image !== undefined) {
    if (
      image !== null &&
      typeof image !== "object"
    ) {
      return sendResponse(
        res,
        400,
        "Image must be an object"
      );
    }

    project.image =
      image === null
        ? {
            public_id: null,
            url: null,
          }
        : {
            public_id:
              image.public_id || null,
            url:
              image.url || null,
          };
  }

  // ----------------------------------------------------------
  // Order
  // ----------------------------------------------------------

  if (order !== undefined) {
    const parsedOrder =
      Number(order);

    if (
      !Number.isInteger(parsedOrder) ||
      parsedOrder < 0
    ) {
      return sendResponse(
        res,
        400,
        "Project order must be a non-negative integer"
      );
    }

    project.order = parsedOrder;
  }

  // ----------------------------------------------------------
  // Published state
  // ----------------------------------------------------------

  if (isPublished !== undefined) {
    project.isPublished =
      Boolean(isPublished);
  }

  // ----------------------------------------------------------
  // Save
  // ----------------------------------------------------------

  await project.save();

  // ----------------------------------------------------------
  // If course changed, update statistics
  // ----------------------------------------------------------

  if (
    String(currentCourse._id) !==
    String(newCourse._id)
  ) {
    await Course.findByIdAndUpdate(
      currentCourse._id,
      {
        $inc: {
          totalProjects: -1,
        },
      }
    );

    await Course.findByIdAndUpdate(
      newCourse._id,
      {
        $inc: {
          totalProjects: 1,
        },
      }
    );
  }

  // ----------------------------------------------------------
  // Return updated project
  // ----------------------------------------------------------

  const updatedProject =
    await Project.findById(
      project._id
    ).populate(
      "course",
      "title slug instructor"
    );

  return sendResponse(
    res,
    200,
    "Course project updated successfully",
    updatedProject
  );
});

// ============================================================
// DELETE COURSE PROJECT
// ============================================================

export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(
      res,
      400,
      "Invalid project ID"
    );
  }

  // ----------------------------------------------------------
  // Find project
  // ----------------------------------------------------------

  const project =
    await Project.findById(id);

  if (!project) {
    return sendResponse(
      res,
      404,
      "Project not found"
    );
  }

  // ----------------------------------------------------------
  // Verify course ownership
  // ----------------------------------------------------------

  const course =
    await Course.findOne({
      _id: project.course,
      instructor: req.user._id,
    });

  if (!course) {
    return sendResponse(
      res,
      403,
      "You are not authorized to delete this project"
    );
  }

  // ----------------------------------------------------------
  // Delete project
  // ----------------------------------------------------------

  await Project.deleteOne({
    _id: project._id,
  });

  // ----------------------------------------------------------
  // Update course statistics
  // ----------------------------------------------------------

  await Course.findByIdAndUpdate(
    course._id,
    {
      $inc: {
        totalProjects: -1,
      },
    }
  );

  // ----------------------------------------------------------
  // Protect against negative counter
  // ----------------------------------------------------------

  await Course.updateOne(
    {
      _id: course._id,
      totalProjects: {
        $lt: 0,
      },
    },
    {
      $set: {
        totalProjects: 0,
      },
    }
  );

  return sendResponse(
    res,
    200,
    "Course project deleted successfully"
  );
});

// ============================================================
// REORDER COURSE PROJECTS
// ============================================================

export const reorderProjects = asyncHandler(
  async (req, res) => {
    const { courseId } = req.params;
    const { projects } = req.body;

    // --------------------------------------------------------
    // Validate course
    // --------------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        courseId
      )
    ) {
      return sendResponse(
        res,
        400,
        "Invalid course ID"
      );
    }

    // --------------------------------------------------------
    // Verify course ownership
    // --------------------------------------------------------

    const course =
      await Course.findOne({
        _id: courseId,
        instructor: req.user._id,
      });

    if (!course) {
      return sendResponse(
        res,
        404,
        "Course not found or you do not own this course"
      );
    }

    // --------------------------------------------------------
    // Validate projects array
    // --------------------------------------------------------

    if (!Array.isArray(projects)) {
      return sendResponse(
        res,
        400,
        "Projects must be an array"
      );
    }

    if (projects.length === 0) {
      return sendResponse(
        res,
        400,
        "Projects array cannot be empty"
      );
    }

    // --------------------------------------------------------
    // Validate each item
    // --------------------------------------------------------

    const operations = [];

    for (let index = 0; index < projects.length; index++) {
      const item = projects[index];

      const projectId =
        typeof item === "object"
          ? item.id || item._id
          : item;

      if (
        !projectId ||
        !mongoose.Types.ObjectId.isValid(
          projectId
        )
      ) {
        return sendResponse(
          res,
          400,
          `Invalid project ID at position ${index}`
        );
      }

      operations.push({
        updateOne: {
          filter: {
            _id: projectId,
            course: courseId,
          },
          update: {
            $set: {
              order: index,
            },
          },
        },
      });
    }

    // --------------------------------------------------------
    // Perform reorder
    // --------------------------------------------------------

    const result =
      await Project.bulkWrite(
        operations
      );

    // --------------------------------------------------------
    // Verify all projects belonged to course
    // --------------------------------------------------------

    if (
      result.matchedCount !==
      projects.length
    ) {
      return sendResponse(
        res,
        400,
        "One or more projects do not belong to this course"
      );
    }

    // --------------------------------------------------------
    // Return reordered projects
    // --------------------------------------------------------

    const reorderedProjects =
      await Project.find({
        course: courseId,
      })
        .populate(
          "course",
          "title slug instructor"
        )
        .sort({
          order: 1,
        });

    return sendResponse(
      res,
      200,
      "Projects reordered successfully",
      reorderedProjects
    );
  }
);