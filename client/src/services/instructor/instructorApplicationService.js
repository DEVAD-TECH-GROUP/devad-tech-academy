import api from "../../api/Api";

/**
 * ============================================================
 * DEVAD TECH ACADEMY
 * INSTRUCTOR APPLICATION SERVICE
 * ============================================================
 *
 * Public instructor application API.
 *
 * Handles:
 * - Submit instructor application
 * - Get application status
 * - Update application
 * - Withdraw application
 *
 * CV uploads use multipart/form-data.
 * ============================================================
 */

/**
 * Submit instructor application
 *
 * Expected FormData fields:
 * - name
 * - email
 * - phone
 * - expertise
 * - experience
 * - portfolio
 * - teachingExperience
 * - course
 * - availability
 * - coverLetter
 * - cv
 */
export const submitInstructorApplication = (formData) =>
  api.post("/instructor/applications", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

/**
 * Get the currently authenticated user's
 * instructor application.
 *
 * Useful when an applicant is logged in and
 * wants to see their application status.
 */
export const getMyInstructorApplication = () =>
  api.get("/instructor/applications/me");

/**
 * Get a specific application.
 *
 * Usually used after receiving an application ID.
 */
export const getInstructorApplication = (id) =>
  api.get(`/instructor/applications/${id}`);

/**
 * Update an existing instructor application.
 *
 * Uses FormData so a CV can also be replaced.
 */
export const updateInstructorApplication = (id, formData) =>
  api.put(`/instructor/applications/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

/**
 * Withdraw an instructor application.
 */
export const withdrawInstructorApplication = (id) =>
  api.delete(`/instructor/applications/${id}`);