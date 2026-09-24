// hooks/public/useCourses.js

import { useCallback, useEffect, useState } from "react";
import {
  getCourses,
  getCourse,
} from "../services/public/courseService";

export function useCourses(params = {}) {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCourses(params);

      const result = response?.data?.data;

      const coursesData = result?.data || [];

      setCourses(
        Array.isArray(coursesData)
          ? coursesData
          : []
      );

      setPagination(result?.pagination || null);
    } catch (error) {
      console.error("Failed to load courses:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to load courses."
      );

      setCourses([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    pagination,
    loading,
    error,
    refetch: fetchCourses,
  };
}

// Get a single course
export function useCourse(id) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  const fetchCourse = useCallback(async () => {
    if (!id) {
      setCourse(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getCourse(id);

      const result = response?.data?.data;

      setCourse(result || null);
    } catch (error) {
      console.error("Failed to load course:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to load course."
      );

      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return {
    course,
    loading,
    error,
    refetch: fetchCourse,
  };
}
