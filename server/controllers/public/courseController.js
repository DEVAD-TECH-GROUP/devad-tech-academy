import mongoose from "mongoose";

import Course from "../../models/course/Course.js";
import Module from "../../models/course/Module.js";
import Lesson from "../../models/course/Lesson.js";

import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

// ============================================================
// GET ALL COURSES
// ============================================================

export const getAllCourses = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    category,
    search,
  } = req.query;

  const query = {
    status: "published",
  };

  // ----------------------------------------------------------
  // Category filter
  // ----------------------------------------------------------

  if (category) {
    query.category = category;
  }

  // ----------------------------------------------------------
  // Search
  // ----------------------------------------------------------

  if (search) {
    query.$or = [
      {
        title: {
          $regex: search,
          $options: "i",
        },
      },
      {
        subtitle: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // ----------------------------------------------------------
  // Pagination
  // ----------------------------------------------------------

  const result = await paginate(Course, query, {
    page,
    limit,

    populate: "instructor category",

    sort: {
      createdAt: -1,
    },
  });

  return sendResponse(
    res,
    200,
    "Courses retrieved",
    result
  );
});

// ============================================================
// GET SINGLE COURSE
// COMPLETE COURSE DETAIL
// ============================================================

export const getCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ----------------------------------------------------------
  // Validate MongoDB ID
  // ----------------------------------------------------------

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(
      res,
      400,
      "Invalid course ID"
    );
  }

  // ----------------------------------------------------------
  // Fetch course
  // ----------------------------------------------------------

  const course = await Course.findById(id)
    .populate(
      "instructor",
      `
        firstName
        lastName
        email
        profileImage
        avatar
        bio
        headline
        skills
      `
    )
    .populate(
      "category",
      `
        name
        description
        icon
        color
        slug
      `
    )
    .lean();

  if (!course) {
    return sendResponse(
      res,
      404,
      "Course not found"
    );
  }

  // ----------------------------------------------------------
  // Fetch modules
  // ----------------------------------------------------------
  //
  // Your course structure uses separate Module documents.
  //
  // Module:
  //   course -> Course
  //
  // ----------------------------------------------------------

  const modules = await Module.find({
    course: course._id,
  })
    .sort({
      order: 1,
      position: 1,
      createdAt: 1,
    })
    .lean();

  // ----------------------------------------------------------
  // Fetch lessons
  // ----------------------------------------------------------
  //
  // Lessons belong to modules.
  //
  // We fetch all lessons belonging to the modules in one
  // database query instead of making one query per module.
  //
  // ----------------------------------------------------------

  const moduleIds = modules.map(
    (module) => module._id
  );

  let lessons = [];

  if (moduleIds.length > 0) {
    lessons = await Lesson.find({
      module: {
        $in: moduleIds,
      },
    })
      .sort({
        order: 1,
        position: 1,
        createdAt: 1,
      })
      .lean();
  }

  // ----------------------------------------------------------
  // Attach lessons to modules
  // ----------------------------------------------------------

  const lessonsByModule = new Map();

  for (const lesson of lessons) {
    const moduleId = String(
      lesson.module
    );

    if (!lessonsByModule.has(moduleId)) {
      lessonsByModule.set(
        moduleId,
        []
      );
    }

    lessonsByModule
      .get(moduleId)
      .push(lesson);
  }

  const populatedModules = modules.map(
    (module) => {
      const moduleLessons =
        lessonsByModule.get(
          String(module._id)
        ) || [];

      return {
        ...module,

        lessons: moduleLessons,

        /*
         * Make sure frontend always has a lesson count.
         */
        lessonsCount:
          moduleLessons.length,
      };
    }
  );

  // ----------------------------------------------------------
  // Build curriculum
  // ----------------------------------------------------------
  //
  // Your CourseDetailPage expects:
  //
  // course.curriculum
  //
  // So provide it explicitly.
  //
  // ----------------------------------------------------------

  const curriculum =
    populatedModules.map(
      (module) => ({
        ...module,

        moduleId: module._id,

        title:
          module.title ||
          module.name ||
          "Untitled Module",

        lessons:
          module.lessons || [],
      })
    );

  // ----------------------------------------------------------
  // Projects
  // ----------------------------------------------------------
  //
  // If projects are embedded in Course, preserve them.
  // If they don't exist, always return [] so the frontend
  // doesn't crash.
  //
  // ----------------------------------------------------------

  const projects = Array.isArray(
    course.projects
  )
    ? course.projects
    : [];

  // ----------------------------------------------------------
  // FAQs
  // ----------------------------------------------------------

  const faqs = Array.isArray(
    course.faqs
  )
    ? course.faqs
    : [];

  // ----------------------------------------------------------
  // Reviews
  // ----------------------------------------------------------

  const reviews = Array.isArray(
    course.reviews
  )
    ? course.reviews
    : [];

  // ----------------------------------------------------------
  // Resources
  // ----------------------------------------------------------
  //
  // Resources may already be stored inside lessons.
  //
  // We therefore normalize the response without assuming
  // another Resource model exists.
  //
  // Every lesson is returned exactly as stored, including
  // resources/media/content fields.
  //
  // ----------------------------------------------------------

  const resources = [];

  for (const lesson of lessons) {
    if (
      Array.isArray(
        lesson.resources
      )
    ) {
      for (const resource of lesson.resources) {
        resources.push({
          ...resource,

          lesson:
            lesson._id,

          lessonId:
            lesson._id,

          module:
            lesson.module,

          moduleId:
            lesson.module,
        });
      }
    }
  }

  // ----------------------------------------------------------
  // Instructor normalization
  // ----------------------------------------------------------

  const instructor =
    course.instructor || null;

  // ----------------------------------------------------------
  // Course totals
  // ----------------------------------------------------------

  const totalLessons =
    lessons.length;

  const totalModules =
    populatedModules.length;

  const totalProjects =
    projects.length;

  // ----------------------------------------------------------
  // Complete course response
  // ----------------------------------------------------------

  const completeCourse = {
    ...course,

    /*
     * Existing course statistics.
     */
    totalModules,

    totalLessons,

    totalProjects,

    /*
     * Complete curriculum.
     */
    curriculum,

    /*
     * Also expose modules directly.
     */
    modules: populatedModules,

    /*
     * Projects.
     */
    projects,

    /*
     * FAQs.
     */
    faqs,

    /*
     * Reviews.
     */
    reviews,

    /*
     * Resources extracted from lessons.
     */
    resources,

    /*
     * Instructor.
     */
    instructor,

    /*
     * Helpful frontend aliases.
     */
    modulesCount: totalModules,

    lessonsCount: totalLessons,

    projectsCount: totalProjects,
  };

  // ----------------------------------------------------------
  // Response
  // ----------------------------------------------------------

  sendResponse(
    res,
    200,
    "Course retrieved",
    completeCourse
  );
});

