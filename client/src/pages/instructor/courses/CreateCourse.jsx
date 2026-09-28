import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../../../services/instructor/courseService";
import Input from "../../../components/common/Input";
import Textarea from "../../../components/common/Textarea";
import Select from "../../../components/common/Select";
import { toast } from "react-hot-toast";

export default function CreateCourse() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
        shortDescription: "",
    description: "",

    category: "",

    level: "beginner",
    language: "English",

    price: 0,
    isFree: true,

    tags: [],
    technologies: [],

    prerequisites: [],
    learningOutcomes: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [technologyInput, setTechnologyInput] = useState("");
  const [prerequisiteInput, setPrerequisiteInput] = useState("");
  const [outcomeInput, setOutcomeInput] = useState("");

  const [creating, setCreating] = useState(false);

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addItem = (key, value, setter) => {
    const trimmed = value.trim();

    if (!trimmed) return;

    if (form[key].includes(trimmed)) {
      toast.error("Already added");
      return;
    }

    set(key, [...form[key], trimmed]);
    setter("");
  };

  const removeItem = (key, index) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      return toast.error("Course title is required");
    }

    if (!form.description.trim()) {
      return toast.error("Course description is required");
    }

    if (!form.category.trim()) {
      return toast.error("Course category is required");
    }

    if (!form.isFree && Number(form.price) <= 0) {
      return toast.error("Enter a valid course price");
    }

    const payload = {
      title: form.title.trim(),
      // subtitle: form.subtitle.trim() || null,
      shortDescription: form.shortDescription.trim() || null,
      description: form.description.trim(),

      category: form.category.trim(),

      level: form.level,
      language: form.language,

      price: form.isFree ? 0 : Number(form.price),
      isFree: form.isFree,

      tags: form.tags,
      technologies: form.technologies,

      prerequisites: form.prerequisites,
      learningOutcomes: form.learningOutcomes,
    };

    setCreating(true);

    try {
      const response = await createCourse(payload);

      const course = response.data?.data;

      toast.success("Course created! Now add your course content 🎉");

      navigate(`/instructor/courses/${course._id}/build`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create course"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5 fi max-w-4xl">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/instructor/courses")}
          className="text-muted hover:text-text transition text-sm"
        >
          ← Back
        </button>

        <div>
          <h1 className="dsp text-xl font-bold text-text">
            Create New Course
          </h1>

          <p className="text-muted text-sm mt-1">
            Set up the basic information for your course.
          </p>
        </div>
      </div>

      {/* BASIC INFORMATION */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="dsp text-sm font-bold text-text">
            Basic Information
          </h2>

          <p className="text-muted text-xs mt-1">
            Information students will see about your course.
          </p>
        </div>

        <Input
          label="Course Title *"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Complete React Development Course"
          required
        />

        {/* <Input
          label="Subtitle"
          value={form.subtitle}
          onChange={(e) => set("subtitle", e.target.value)}
          placeholder="A short supporting statement for your course"
        /> */}

        <Input
          label="Short Description"
          value={form.shortDescription}
          onChange={(e) => set("shortDescription", e.target.value)}
          placeholder="Briefly describe what this course is about"
        />

        <Textarea
          label="Course Description *"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Detailed description of what students will learn..."
          rows={7}
          required
        />
      </div>

      {/* COURSE SETTINGS */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="dsp text-sm font-bold text-text">
            Course Settings
          </h2>

          <p className="text-muted text-xs mt-1">
            Configure the level, language, category and pricing.
          </p>
        </div>

        <Input
          label="Category *"
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          placeholder="e.g. Software Development"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label="Level"
            value={form.level}
            onChange={(e) => set("level", e.target.value)}
            options={[
              {
                value: "beginner",
                label: "Beginner",
              },
              {
                value: "intermediate",
                label: "Intermediate",
              },
              {
                value: "advanced",
                label: "Advanced",
              },
            ]}
          />

          <Select
            label="Language"
            value={form.language}
            onChange={(e) => set("language", e.target.value)}
            options={[
              {
                value: "English",
                label: "English",
              },
              {
                value: "Pidgin",
                label: "Pidgin English",
              },
              {
                value: "Yoruba",
                label: "Yoruba",
              },
              {
                value: "Igbo",
                label: "Igbo",
              },
              {
                value: "Hausa",
                label: "Hausa",
              },
            ]}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-text">
            Course Pricing
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                set("isFree", true);
                set("price", 0);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                form.isFree
                  ? "bg-orange text-white border-orange"
                  : "bg-surfaceHigh text-muted border-border hover:text-text"
              }`}
            >
              Free
            </button>

            <button
              type="button"
              onClick={() => set("isFree", false)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                !form.isFree
                  ? "bg-orange text-white border-orange"
                  : "bg-surfaceHigh text-muted border-border hover:text-text"
              }`}
            >
              Paid
            </button>
          </div>

          {!form.isFree && (
            <Input
              label="Price (₦)"
              type="number"
              min="0"
              value={form.price}
              onChange={(e) =>
                set("price", Number(e.target.value))
              }
              placeholder="e.g. 150000"
            />
          )}
        </div>
      </div>

      {/* TECHNOLOGIES */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="dsp text-sm font-bold text-text">
            Technologies
          </h2>

          <p className="text-muted text-xs mt-1">
            Technologies and tools students will work with.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            label=""
            value={technologyInput}
            onChange={(e) => setTechnologyInput(e.target.value)}
            placeholder="e.g. React"
          />

          <button
            type="button"
            onClick={() =>
              addItem(
                "technologies",
                technologyInput,
                setTechnologyInput
              )
            }
            className="self-end px-4 py-3 bg-surfaceHigh border border-border rounded-xl text-sm font-semibold text-text hover:border-orange/40 transition"
          >
            Add
          </button>
        </div>

        {form.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.technologies.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surfaceHigh border border-border text-sm text-text"
              >
                <span>{item}</span>

                <button
                  type="button"
                  onClick={() =>
                    removeItem("technologies", index)
                  }
                  className="text-muted hover:text-red-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TAGS */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="dsp text-sm font-bold text-text">
            Course Tags
          </h2>

          <p className="text-muted text-xs mt-1">
            Add keywords that help identify your course.
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            label=""
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="e.g. javascript"
          />

          <button
            type="button"
            onClick={() =>
              addItem("tags", tagInput, setTagInput)
            }
            className="self-end px-4 py-3 bg-surfaceHigh border border-border rounded-xl text-sm font-semibold text-text hover:border-orange/40 transition"
          >
            Add
          </button>
        </div>

        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.tags.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange/10 border border-orange/20 text-sm text-orange"
              >
                <span>#{item}</span>

                <button
                  type="button"
                  onClick={() => removeItem("tags", index)}
                  className="text-orange/70 hover:text-orange"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PREREQUISITES */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="dsp text-sm font-bold text-text">
            Prerequisites
          </h2>

          <p className="text-muted text-xs mt-1">
            What should students know or have before starting?
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            label=""
            value={prerequisiteInput}
            onChange={(e) =>
              setPrerequisiteInput(e.target.value)
            }
            placeholder="e.g. Basic JavaScript knowledge"
          />

          <button
            type="button"
            onClick={() =>
              addItem(
                "prerequisites",
                prerequisiteInput,
                setPrerequisiteInput
              )
            }
            className="self-end px-4 py-3 bg-surfaceHigh border border-border rounded-xl text-sm font-semibold text-text hover:border-orange/40 transition"
          >
            Add
          </button>
        </div>

        {form.prerequisites.length > 0 && (
          <div className="space-y-2">
            {form.prerequisites.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surfaceHigh border border-border text-sm text-text"
              >
                <span>• {item}</span>

                <button
                  type="button"
                  onClick={() =>
                    removeItem("prerequisites", index)
                  }
                  className="text-muted hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LEARNING OUTCOMES */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="dsp text-sm font-bold text-text">
            Learning Outcomes
          </h2>

          <p className="text-muted text-xs mt-1">
            What should students be able to do after completing this course?
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            label=""
            value={outcomeInput}
            onChange={(e) =>
              setOutcomeInput(e.target.value)
            }
            placeholder="e.g. Build production-ready React applications"
          />

          <button
            type="button"
            onClick={() =>
              addItem(
                "learningOutcomes",
                outcomeInput,
                setOutcomeInput
              )
            }
            className="self-end px-4 py-3 bg-surfaceHigh border border-border rounded-xl text-sm font-semibold text-text hover:border-orange/40 transition"
          >
            Add
          </button>
        </div>

        {form.learningOutcomes.length > 0 && (
          <div className="space-y-2">
            {form.learningOutcomes.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surfaceHigh border border-border text-sm text-text"
              >
                <span>✓ {item}</span>

                <button
                  type="button"
                  onClick={() =>
                    removeItem("learningOutcomes", index)
                  }
                  className="text-muted hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 pb-6">
        <button
          type="button"
          onClick={() => navigate("/instructor/courses")}
          className="flex-1 bg-surfaceHigh border border-border text-text font-semibold py-3 rounded-xl text-sm hover:border-orange/40 transition"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="flex-1 bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Course →"}
        </button>
      </div>
    </div>
  );
}
