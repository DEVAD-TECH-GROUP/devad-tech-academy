import Course from "../../models/course/Course.js";
import paginate from "../../utils/pagination.js";
import sendResponse from "../../utils/sendResponse.js";
import asyncHandler from "../../middlewares/error/asyncHandler.js";


// ── Get all courses ───────────────────────────────────────
export const getAllCourses = asyncHandler(async (req, res) => {
  const { page, limit, status, category, search } = req.query;

  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
    ];
  }

  const result = await paginate(Course, query, {
    page, limit,
    populate: "instructor category",
    sort: { createdAt: -1 },
  });

  sendResponse(res, 200, "Courses retrieved", result);
});

// ── Get single course ─────────────────────────────────────
export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate("instructor", "firstName lastName email")
    .populate("category", "name");

  if (!course) return sendResponse(res, 404, "Course not found");
  sendResponse(res, 200, "Course retrieved", course);
});
