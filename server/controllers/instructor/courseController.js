import mongoose from "mongoose";

import Course from "../../models/course/Course.js";
import Module from "../../models/course/Module.js";
import Lesson from "../../models/course/Lesson.js";
import Project from "../../models/course/Project.js";
import FAQ from "../../models/course/FAQ.js";
import Resource from "../../models/course/Resource.js";
import Enrollment from "../../models/learning/Enrollment.js";

import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";

import {
  createCourseValidator,
  updateCourseValidator,
} from "../../validators/instructor/courseValidator.js";

import { COURSE_STATUS } from "../../utils/constants.js";

/**
 * ============================================================
 * GET MY COURSES
 * ============================================================
 */
export const getMyCourses = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    status,
    search,
  } = req.query;

  const query = {
    instructor: req.user._id,
  };

  if (status) {
    query.status = status;
  }

  if (search && search.trim()) {
    query.title = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  const result = await paginate(Course, query, {
    page,
    limit,
    populate: "category",
    sort: {
      createdAt: -1,
    },
  });

  return sendResponse(
    res,
    200,
    "Courses retrieved successfully",
    result
  );
});

/**
 * ============================================================
 * CREATE COURSE
 * ============================================================
 */
export const createCourse = asyncHandler(async (req, res) => {
  const {
    error,
    value,
  } = createCourseValidator(req.body);

  if (error) {
    return sendResponse(
      res,
      400,
      error.details
        .map((detail) => detail.message)
        .join(", ")
    );
  }

  const course = await Course.create({
    ...value,

    instructor: req.user._id,

    status: COURSE_STATUS.DRAFT,

    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    publishedAt: null,
  });

  const populatedCourse = await Course.findById(course._id)
    .populate("category", "name slug description icon color")
    .populate("instructor", "firstName lastName email");

  return sendResponse(
    res,
    201,
    "Course created successfully",
    populatedCourse
  );
});

/**
 * ============================================================
 * GET SINGLE COURSE
 * ============================================================
 */
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  })
    .populate(
      "category",
      "name slug description icon color"
    )
    .populate(
      "approvedBy",
      "firstName lastName email"
    )
    .populate(
      "instructor",
      "firstName lastName email"
    );

  if (!course) {
    return sendResponse(
      res,
      404,
      "Course not found"
    );
  }

  return sendResponse(
    res,
    200,
    "Course retrieved successfully",
    course
  );
});

/**
 * ============================================================
 * GET COMPLETE COURSE BUILD DATA
 *
 * Returns:
 * Course
 * Modules
 * Lessons
 * Projects
 * FAQs
 * Resources
 * ============================================================
 */
export const getCourseBuildData = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(
        res,
        400,
        "Invalid course ID"
      );
    }

    const course = await Course.findOne({
      _id: id,
      instructor: req.user._id,
    })
      .populate(
        "category",
        "name slug description icon color"
      )
      .populate(
        "instructor",
        "firstName lastName email"
      )
      .populate(
        "approvedBy",
        "firstName lastName email"
      );

    if (!course) {
      return sendResponse(
        res,
        404,
        "Course not found"
      );
    }

    const [
      modules,
      projects,
      faqs,
      resources,
    ] = await Promise.all([
      Module.find({
        course: id,
      }).sort({
        order: 1,
      }),

      Project.find({
        course: id,
      }).sort({
        order: 1,
      }),

      FAQ.find({
        course: id,
      }).sort({
        order: 1,
      }),

      Resource.find({
        course: id,
      }).sort({
        createdAt: 1,
      }),
    ]);

    const moduleIds = modules.map(
      (module) => module._id
    );

    const lessons = moduleIds.length
      ? await Lesson.find({
          course: id,
          module: {
            $in: moduleIds,
          },
        })
          .populate(
            "resources",
            "name description type file totalDownloads isPublic"
          )
          .sort({
            order: 1,
          })
      : [];

    const modulesWithLessons = modules.map(
      (module) => ({
        ...module.toObject(),

        lessons: lessons.filter(
          (lesson) =>
            String(lesson.module) ===
            String(module._id)
        ),
      })
    );

    return sendResponse(
      res,
      200,
      "Course build data retrieved successfully",
      {
        course,
        modules: modulesWithLessons,
        projects,
        faqs,
        resources,
      }
    );
  }
);

/**
 * ============================================================
 * UPDATE COURSE
 * ============================================================
 */
export const updateCourse = asyncHandler(async (req, res) => {
  const {
    error,
    value,
  } = updateCourseValidator(req.body);

  if (error) {
    return sendResponse(
      res,
      400,
      error.details
        .map((detail) => detail.message)
        .join(", ")
    );
  }

  const course = await Course.findOne({
    _id: req.params.id,
    instructor: req.user._id,
  });

  if (!course) {
    return sendResponse(
      res,
      404,
      "Course not found"
    );
  }

  /**
   * Prevent instructors from changing
   * approval-controlled fields.
   */
  delete value.status;
  delete value.approvedBy;
  delete value.approvedAt;
  delete value.rejectionReason;
  delete value.publishedAt;
  delete value.instructor;
  delete value.slug;

  /**
   * If a rejected course is edited again,
   * clear the rejection reason.
   */
  if (
    course.status === COURSE_STATUS.REJECTED &&
    Object.keys(value).length > 0
  ) {
    course.rejectionReason = null;
  }

  Object.assign(course, value);

  await course.save();

  const updatedCourse = await Course.findById(
    course._id
  )
    .populate(
      "category",
      "name slug description icon color"
    )
    .populate(
      "approvedBy",
      "firstName lastName email"
    )
    .populate(
      "instructor",
      "firstName lastName email"
    );

  return sendResponse(
    res,
    200,
    "Course updated successfully",
    updatedCourse
  );
});

/**
 * ============================================================
 * DELETE COURSE
 * ============================================================
 *
 * Only DRAFT and REJECTED courses can be deleted.
 *
 * Also removes:
 * - Modules
 * - Lessons
 * - Projects
 * - FAQs
 * - Resources
 * ============================================================
 */
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    instructor: req.user._id,
    status: {
      $in: [
        COURSE_STATUS.DRAFT,
        COURSE_STATUS.REJECTED,
      ],
    },
  });

  if (!course) {
    return sendResponse(
      res,
      404,
      "Course not found or cannot be deleted"
    );
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const modules = await Module.find({
      course: course._id,
    })
      .select("_id")
      .session(session);

    const moduleIds = modules.map(
      (module) => module._id
    );

    await Lesson.deleteMany(
      {
        course: course._id,
      },
      {
        session,
      }
    );

    await Resource.deleteMany(
      {
        course: course._id,
      },
      {
        session,
      }
    );

    await Project.deleteMany(
      {
        course: course._id,
      },
      {
        session,
      }
    );

    await FAQ.deleteMany(
      {
        course: course._id,
      },
      {
        session,
      }
    );

    if (moduleIds.length > 0) {
      await Module.deleteMany(
        {
          _id: {
            $in: moduleIds,
          },
        },
        {
          session,
        }
      );
    }

    await Course.deleteOne(
      {
        _id: course._id,
      },
      {
        session,
      }
    );

    await session.commitTransaction();

    return sendResponse(
      res,
      200,
      "Course and all associated content deleted successfully"
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

/**
 * ============================================================
 * SUBMIT COURSE FOR REVIEW
 * ============================================================
 */
export const submitForReview = asyncHandler(
  async (req, res) => {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id,
    });

    if (!course) {
      return sendResponse(
        res,
        404,
        "Course not found"
      );
    }

    /**
     * Already pending review.
     */
    if (
      course.status ===
      COURSE_STATUS.PENDING_REVIEW
    ) {
      return sendResponse(
        res,
        400,
        "Course is already pending review"
      );
    }

    /**
     * Published courses should not be resubmitted
     * through the instructor endpoint.
     */
    if (
      course.status === COURSE_STATUS.PUBLISHED
    ) {
      return sendResponse(
        res,
        400,
        "Published courses cannot be submitted again"
      );
    }

    /**
     * Basic content validation before submission.
     */
    const [
      moduleCount,
      lessonCount,
      projectCount,
    ] = await Promise.all([
      Module.countDocuments({
        course: course._id,
      }),

      Lesson.countDocuments({
        course: course._id,
      }),

      Project.countDocuments({
        course: course._id,
      }),
    ]);

    if (moduleCount === 0) {
      return sendResponse(
        res,
        400,
        "Add at least one module before submitting the course for review"
      );
    }

    if (lessonCount === 0) {
      return sendResponse(
        res,
        400,
        "Add at least one lesson before submitting the course for review"
      );
    }

    if (
      !course.learningOutcomes ||
      course.learningOutcomes.length === 0
    ) {
      return sendResponse(
        res,
        400,
        "Add at least one learning outcome before submitting the course for review"
      );
    }

    /**
     * Update course statistics before submission.
     */
    course.totalModules = moduleCount;
    course.totalLessons = lessonCount;
    course.totalProjects = projectCount;

    course.status =
      COURSE_STATUS.PENDING_REVIEW;

    course.approvedBy = null;
    course.approvedAt = null;
    course.publishedAt = null;

    await course.save();

    return sendResponse(
      res,
      200,
      "Course submitted for review successfully",
      course
    );
  }
);

/**
 * ============================================================
 * PUBLISH COURSE
 *
 * Kept for backward compatibility with existing frontend.
 *
 * Internally uses the same review submission logic.
 * ============================================================
 */
export const publishCourse = asyncHandler(
  async (req, res) => {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id,
    });

    if (!course) {
      return sendResponse(
        res,
        404,
        "Course not found"
      );
    }

    if (
      course.status ===
      COURSE_STATUS.PUBLISHED
    ) {
      return sendResponse(
        res,
        400,
        "Course is already published"
      );
    }

    if (
      course.status ===
      COURSE_STATUS.PENDING_REVIEW
    ) {
      return sendResponse(
        res,
        400,
        "Course is already pending review"
      );
    }

    const [
      moduleCount,
      lessonCount,
      projectCount,
    ] = await Promise.all([
      Module.countDocuments({
        course: course._id,
      }),

      Lesson.countDocuments({
        course: course._id,
      }),

      Project.countDocuments({
        course: course._id,
      }),
    ]);

    if (moduleCount === 0) {
      return sendResponse(
        res,
        400,
        "Add at least one module before submitting the course"
      );
    }

    if (lessonCount === 0) {
      return sendResponse(
        res,
        400,
        "Add at least one lesson before submitting the course"
      );
    }

    course.totalModules = moduleCount;
    course.totalLessons = lessonCount;
    course.totalProjects = projectCount;

    course.status =
      COURSE_STATUS.PENDING_REVIEW;

    course.approvedBy = null;
    course.approvedAt = null;
    course.publishedAt = null;

    await course.save();

    return sendResponse(
      res,
      200,
      "Course submitted for review successfully",
      course
    );
  }
);

/**
 * ============================================================
 * GET COURSE ANALYTICS
 * ============================================================
 */
export const getCourseAnalytics = asyncHandler(
  async (req, res) => {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id,
    });

    if (!course) {
      return sendResponse(
        res,
        404,
        "Course not found"
      );
    }

    const [
      enrollments,
      completed,
      modules,
      lessons,
      projects,
      resources,
    ] = await Promise.all([
      Enrollment.countDocuments({
        course: course._id,
      }),

      Enrollment.countDocuments({
        course: course._id,
        isCompleted: true,
      }),

      Module.countDocuments({
        course: course._id,
      }),

      Lesson.countDocuments({
        course: course._id,
      }),

      Project.countDocuments({
        course: course._id,
      }),

      Resource.countDocuments({
        course: course._id,
      }),
    ]);

    const completionRate =
      enrollments > 0
        ? Math.round(
            (completed / enrollments) * 100
          )
        : 0;

    return sendResponse(
      res,
      200,
      "Course analytics retrieved successfully",
      {
        course,

        statistics: {
          enrollments,
          completedEnrollments: completed,
          completionRate,

          modules,
          lessons,
          projects,
          resources,
        },
      }
    );
  }
);

/**
 * ============================================================
 * REBUILD COURSE STATISTICS
 *
 * Useful after modules/lessons/projects are changed.
 * ============================================================
 */
export const rebuildCourseStatistics =
  asyncHandler(async (req, res) => {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id,
    });

    if (!course) {
      return sendResponse(
        res,
        404,
        "Course not found"
      );
    }

    const [
      modules,
      lessons,
      projects,
    ] = await Promise.all([
      Module.find({
        course: course._id,
      }).select("_id"),

      Lesson.find({
        course: course._id,
      }).select("duration video"),

      Project.find({
        course: course._id,
      }).select("_id"),
    ]);

    const totalDuration = lessons.reduce(
      (total, lesson) => {
        return (
          total +
          Number(
            lesson.video?.duration || 0
          )
        );
      },
      0
    );

    course.totalModules = modules.length;
    course.totalLessons = lessons.length;
    course.totalProjects = projects.length;
    course.totalDuration = totalDuration;

    await course.save();

    return sendResponse(
      res,
      200,
      "Course statistics rebuilt successfully",
      {
        totalModules: course.totalModules,
        totalLessons: course.totalLessons,
        totalProjects: course.totalProjects,
        totalDuration: course.totalDuration,
      }
    );
  });