import { useCallback, useState } from "react";
import {
  getMyProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  reorderProjects,
} from "../../services/instructor/courseProjectService";

export default function useCourseProjects() {
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMyProjects(params);

      const data = response.data?.data;

      setProjects(data?.data || []);

      return data;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load projects"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProject = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProject(id);

      const data = response.data?.data;

      setProject(data);

      return data;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load project"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addProject = useCallback(async (payload) => {
    setSaving(true);
    setError(null);

    try {
      const response = await createProject(payload);

      const newProject = response.data?.data;

      setProjects((current) => [
        newProject,
        ...current,
      ]);

      return newProject;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create project"
      );
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const editProject = useCallback(
    async (id, payload) => {
      setSaving(true);
      setError(null);

      try {
        const response = await updateProject(
          id,
          payload
        );

        const updatedProject =
          response.data?.data;

        setProjects((current) =>
          current.map((item) =>
            item._id === id
              ? updatedProject
              : item
          )
        );

        setProject(updatedProject);

        return updatedProject;
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to update project"
        );
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const removeProject = useCallback(
    async (id) => {
      setDeleting(id);
      setError(null);

      try {
        await deleteProject(id);

        setProjects((current) =>
          current.filter(
            (item) => item._id !== id
          )
        );

        if (project?._id === id) {
          setProject(null);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to delete project"
        );
        throw err;
      } finally {
        setDeleting(null);
      }
    },
    [project]
  );

  const reorder = useCallback(
    async (courseId, projectList) => {
      setSaving(true);
      setError(null);

      try {
        const response =
          await reorderProjects(
            courseId,
            projectList
          );

        const updatedProjects =
          response.data?.data || [];

        setProjects(updatedProjects);

        return updatedProjects;
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to reorder projects"
        );
        throw err;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return {
    projects,
    project,
    loading,
    saving,
    deleting,
    error,

    fetchProjects,
    fetchProject,
    addProject,
    editProject,
    removeProject,
    reorder,

    setProjects,
    setProject,
  };
}