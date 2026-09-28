import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../../../services/instructor/courseService";

import Input from "../../../components/common/Input";
import Textarea from "../../../components/common/Textarea";
import Select from "../../../components/common/Select";

import { toast } from "react-hot-toast";

const STEPS = [
  {
    number: 1,
    title: "Basic Information",
    description: "Tell students what your course is about.",
  },
  {
    number: 2,
    title: "Classification",
    description: "Organize your course and define its technologies.",
  },
  {
    number: 3,
    title: "Learning",
    description: "Define prerequisites and learning outcomes.",
  },
  {
    number: 4,
    title: "Pricing",
    description: "Configure your course pricing and installments.",
  },
  {
    number: 5,
    title: "Settings & Live Classes",
    description: "Configure enrollment, certificates and live classes.",
  },
];

export default function CreateCourse() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    // ========================================================
    // STEP 1 - BASIC INFORMATION
    // ========================================================

    title: "",
    subtitle: "",
    shortDescription: "",
    description: "",

    // ========================================================
    // STEP 2 - CLASSIFICATION
    // ========================================================

    category: "",
    level: "beginner",
    language: "English",
    tags: [],
    technologies: [],

    // ========================================================
    // STEP 3 - LEARNING
    // ========================================================

    prerequisites: [],
    learningOutcomes: [],

    // ========================================================
    // STEP 4 - PRICING
    // ========================================================

    isFree: true,
    price: 0,
    discountPrice: null,
    discountExpiry: "",

    installments: {
      enabled: false,
      amount: 0,
      count: 0,
      interval: "monthly",
    },

    // ========================================================
    // STEP 5 - SETTINGS
    // ========================================================

    settings: {
      enrollmentType: "open",
      hasCertificate: true,
      hasDiscussion: true,
      dripContent: false,
      allowDownloads: true,
    },

    liveClasses: {
      enabled: false,
      frequency: "weekly",
      duration: 60,
      platform: "google-meet",
      description: "",
    },
  });

  // ==========================================================
  // ARRAY INPUTS
  // ==========================================================

  const [tagInput, setTagInput] = useState("");
  const [technologyInput, setTechnologyInput] = useState("");
  const [prerequisiteInput, setPrerequisiteInput] = useState("");
  const [outcomeInput, setOutcomeInput] = useState("");

  // ==========================================================
  // GENERIC SETTERS
  // ==========================================================

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const setNested = (parent, key, value) => {
    setForm((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value,
      },
    }));
  };

  // ==========================================================
  // ARRAY HELPERS
  // ==========================================================

  const addItem = (key, value, setter) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    const exists = form[key].some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
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

  // ==========================================================
  // STEP VALIDATION
  // ==========================================================

  const validateStep = (currentStep) => {
    // --------------------------------------------------------
    // STEP 1
    // --------------------------------------------------------

    if (currentStep === 1) {
      if (!form.title.trim()) {
        toast.error("Course title is required");
        return false;
      }

      if (form.title.trim().length < 5) {
        toast.error("Course title must be at least 5 characters");
        return false;
      }

      if (!form.description.trim()) {
        toast.error("Course description is required");
        return false;
      }

      if (form.description.trim().length < 20) {
        toast.error(
          "Course description must be at least 20 characters"
        );
        return false;
      }

      return true;
    }

    // --------------------------------------------------------
    // STEP 2
    // --------------------------------------------------------

    if (currentStep === 2) {
      if (!form.category.trim()) {
        toast.error("Course category is required");
        return false;
      }

      return true;
    }

    // --------------------------------------------------------
    // STEP 3
    // --------------------------------------------------------

    if (currentStep === 3) {
      if (form.learningOutcomes.length === 0) {
        toast.error("Add at least one learning outcome");
        return false;
      }

      return true;
    }

    // --------------------------------------------------------
    // STEP 4
    // --------------------------------------------------------

    if (currentStep === 4) {
      if (!form.isFree) {
        const price = Number(form.price);

        if (!Number.isFinite(price) || price <= 0) {
          toast.error("Enter a valid course price");
          return false;
        }

        if (
          form.discountPrice !== null &&
          form.discountPrice !== "" &&
          Number(form.discountPrice) >= price
        ) {
          toast.error(
            "Discount price must be lower than the original price"
          );
          return false;
        }

        if (
          form.installments.enabled &&
          Number(form.installments.amount) <= 0
        ) {
          toast.error("Enter a valid installment amount");
          return false;
        }

        if (
          form.installments.enabled &&
          Number(form.installments.count) <= 0
        ) {
          toast.error("Enter a valid installment count");
          return false;
        }
      }

      return true;
    }

    // --------------------------------------------------------
    // STEP 5
    // --------------------------------------------------------

    if (currentStep === 5) {
      if (form.liveClasses.enabled) {
        if (Number(form.liveClasses.duration) < 15) {
          toast.error(
            "Live class duration must be at least 15 minutes"
          );
          return false;
        }
      }

      return true;
    }

    return true;
  };

  // ==========================================================
  // NEXT
  // ==========================================================

  const handleNext = () => {
    if (!validateStep(step)) {
      return;
    }

    setStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  // ==========================================================
  // BACK
  // ==========================================================

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // ==========================================================
  // CREATE COURSE
  // ==========================================================

  const handleCreate = async () => {
    if (!validateStep(5)) {
      return;
    }

    const payload = {
      // ======================================================
      // BASIC INFORMATION
      // ======================================================

      title: form.title.trim(),

      subtitle:
        form.subtitle.trim() || null,

      shortDescription:
        form.shortDescription.trim() || null,

      description:
        form.description.trim(),

      // ======================================================
      // CLASSIFICATION
      // ======================================================

      category:
        form.category.trim(),

      level:
        form.level,

      language:
        form.language,

      tags:
        form.tags,

      technologies:
        form.technologies,

      // ======================================================
      // LEARNING
      // ======================================================

      prerequisites:
        form.prerequisites,

      learningOutcomes:
        form.learningOutcomes,

      // ======================================================
      // PRICING
      // ======================================================

      isFree:
        form.isFree,

      price:
        form.isFree
          ? 0
          : Number(form.price),

      discountPrice:
        form.isFree ||
        form.discountPrice === "" ||
        form.discountPrice === null
          ? null
          : Number(form.discountPrice),

      discountExpiry:
        form.isFree ||
        !form.discountExpiry
          ? null
          : form.discountExpiry,

      installments: {
        enabled:
          form.isFree
            ? false
            : form.installments.enabled,

        amount:
          form.isFree
            ? 0
            : Number(form.installments.amount || 0),

        count:
          form.isFree
            ? 0
            : Number(form.installments.count || 0),

        interval:
          form.installments.interval,
      },

      // ======================================================
      // SETTINGS
      // ======================================================

      settings: {
        enrollmentType:
          form.settings.enrollmentType,

        hasCertificate:
          form.settings.hasCertificate,

        hasDiscussion:
          form.settings.hasDiscussion,

        dripContent:
          form.settings.dripContent,

        allowDownloads:
          form.settings.allowDownloads,
      },

      // ======================================================
      // LIVE CLASSES
      // ======================================================

      liveClasses: {
        enabled:
          form.liveClasses.enabled,

        frequency:
          form.liveClasses.frequency,

        duration:
          Number(form.liveClasses.duration),

        platform:
          form.liveClasses.platform,

        description:
          form.liveClasses.description.trim() || null,
      },
    };

    setCreating(true);

    try {
      const response = await createCourse(payload);

      const course = response.data?.data;

      if (!course?._id) {
        throw new Error("Course was created but no course ID was returned");
      }

      toast.success(
        "Course created! Now add your course content 🎉"
      );

      navigate(
        `/instructor/courses/${course._id}/build`
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to create course"
      );
    } finally {
      setCreating(false);
    }
  };

  // ==========================================================
  // RENDER STEP INDICATOR
  // ==========================================================

  const renderStepIndicator = () => {
    return (
      <div className="bg-surface border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {STEPS.map((item, index) => {
            const active = step === item.number;
            const completed = step > item.number;

            return (
              <div
                key={item.number}
                className="flex items-center flex-1 min-w-[130px]"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (item.number < step) {
                      setStep(item.number);
                    }
                  }}
                  className="flex items-center gap-2 text-left"
                >
                  <div
                    className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold border transition ${
                      active
                        ? "bg-orange text-white border-orange"
                        : completed
                        ? "bg-orange/15 text-orange border-orange/30"
                        : "bg-surfaceHigh text-muted border-border"
                    }`}
                  >
                    {completed ? "✓" : item.number}
                  </div>

                  <div className="hidden lg:block">
                    <p
                      className={`text-xs font-semibold ${
                        active
                          ? "text-text"
                          : "text-muted"
                      }`}
                    >
                      {item.title}
                    </p>

                    <p className="text-[10px] text-muted mt-0.5">
                      Step {item.number}
                    </p>
                  </div>
                </button>

                {index < STEPS.length - 1 && (
                  <div
                    className={`h-px flex-1 mx-3 ${
                      step > item.number
                        ? "bg-orange/40"
                        : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ==========================================================
  // STEP 1
  // ==========================================================

  const renderBasicInformation = () => {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="dsp text-lg font-bold text-text">
            Basic Information
          </h2>

          <p className="text-muted text-sm mt-1">
            Information students will see when they discover your course.
          </p>
        </div>

        <Input
          label="Course Title *"
          value={form.title}
          onChange={(e) =>
            set("title", e.target.value)
          }
          placeholder="e.g. Complete React Development Course"
          required
        />

        <Input
          label="Subtitle"
          value={form.subtitle}
          onChange={(e) =>
            set("subtitle", e.target.value)
          }
          placeholder="A short supporting statement for your course"
        />

        <Input
          label="Short Description"
          value={form.shortDescription}
          onChange={(e) =>
            set(
              "shortDescription",
              e.target.value
            )
          }
          placeholder="Briefly describe what this course is about"
        />

        <Textarea
          label="Course Description *"
          value={form.description}
          onChange={(e) =>
            set(
              "description",
              e.target.value
            )
          }
          placeholder="Detailed description of what students will learn..."
          rows={9}
          required
        />
      </div>
    );
  };

  // ==========================================================
  // STEP 2
  // ==========================================================

  const renderClassification = () => {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="dsp text-lg font-bold text-text">
            Classification
          </h2>

          <p className="text-muted text-sm mt-1">
            Help students understand the level, category and technologies
            covered by this course.
          </p>
        </div>

        <Input
          label="Category *"
          value={form.category}
          onChange={(e) =>
            set("category", e.target.value)
          }
          placeholder="Enter the course category ID"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Level"
            value={form.level}
            onChange={(e) =>
              set("level", e.target.value)
            }
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
            onChange={(e) =>
              set("language", e.target.value)
            }
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

        {/* TECHNOLOGIES */}

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-text">
              Technologies
            </h3>

            <p className="text-xs text-muted mt-1">
              Add technologies and tools students will use.
            </p>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label=""
                value={technologyInput}
                onChange={(e) =>
                  setTechnologyInput(
                    e.target.value
                  )
                }
                placeholder="e.g. React"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                addItem(
                  "technologies",
                  technologyInput,
                  setTechnologyInput
                )
              }
              className="px-4 py-3 bg-surfaceHigh border border-border rounded-xl text-sm font-semibold text-text hover:border-orange/40 transition"
            >
              Add
            </button>
          </div>

          {form.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.technologies.map(
                (item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surfaceHigh border border-border text-sm text-text"
                  >
                    <span>{item}</span>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          "technologies",
                          index
                        )
                      }
                      className="text-muted hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* TAGS */}

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-text">
              Course Tags
            </h3>

            <p className="text-xs text-muted mt-1">
              Add keywords that help identify your course.
            </p>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label=""
                value={tagInput}
                onChange={(e) =>
                  setTagInput(e.target.value)
                }
                placeholder="e.g. javascript"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                addItem(
                  "tags",
                  tagInput,
                  setTagInput
                )
              }
              className="px-4 py-3 bg-surfaceHigh border border-border rounded-xl text-sm font-semibold text-text hover:border-orange/40 transition"
            >
              Add
            </button>
          </div>

          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.tags.map(
                (item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange/10 border border-orange/20 text-sm text-orange"
                  >
                    <span>#{item}</span>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          "tags",
                          index
                        )
                      }
                      className="text-orange/70 hover:text-orange"
                    >
                      ×
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==========================================================
  // STEP 3
  // ==========================================================

  const renderLearning = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="dsp text-lg font-bold text-text">
            Learning
          </h2>

          <p className="text-muted text-sm mt-1">
            Define what students should know before starting and what they
            should be able to accomplish after completing the course.
          </p>
        </div>

        {/* PREREQUISITES */}

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-text">
              Prerequisites
            </h3>

            <p className="text-xs text-muted mt-1">
              What should students know or have before starting?
            </p>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label=""
                value={prerequisiteInput}
                onChange={(e) =>
                  setPrerequisiteInput(
                    e.target.value
                  )
                }
                placeholder="e.g. Basic JavaScript knowledge"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                addItem(
                  "prerequisites",
                  prerequisiteInput,
                  setPrerequisiteInput
                )
              }
              className="px-4 py-3 bg-surfaceHigh border border-border rounded-xl text-sm font-semibold text-text hover:border-orange/40 transition"
            >
              Add
            </button>
          </div>

          {form.prerequisites.length > 0 && (
            <div className="space-y-2">
              {form.prerequisites.map(
                (item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surfaceHigh border border-border text-sm text-text"
                  >
                    <span>
                      • {item}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          "prerequisites",
                          index
                        )
                      }
                      className="text-muted hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* LEARNING OUTCOMES */}

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-text">
              Learning Outcomes *
            </h3>

            <p className="text-xs text-muted mt-1">
              What should students be able to do after completing this course?
            </p>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label=""
                value={outcomeInput}
                onChange={(e) =>
                  setOutcomeInput(
                    e.target.value
                  )
                }
                placeholder="e.g. Build production-ready React applications"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                addItem(
                  "learningOutcomes",
                  outcomeInput,
                  setOutcomeInput
                )
              }
              className="px-4 py-3 bg-surfaceHigh border border-border rounded-xl text-sm font-semibold text-text hover:border-orange/40 transition"
            >
              Add
            </button>
          </div>

          {form.learningOutcomes.length > 0 && (
            <div className="space-y-2">
              {form.learningOutcomes.map(
                (item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surfaceHigh border border-border text-sm text-text"
                  >
                    <span>
                      ✓ {item}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          "learningOutcomes",
                          index
                        )
                      }
                      className="text-muted hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==========================================================
  // STEP 4
  // ==========================================================

  const renderPricing = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="dsp text-lg font-bold text-text">
            Pricing
          </h2>

          <p className="text-muted text-sm mt-1">
            Configure how students will pay for this course.
          </p>
        </div>

        {/* FREE / PAID */}

        <div className="space-y-3">
          <label className="block text-sm font-medium text-text">
            Course Type
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                set("isFree", true);
                set("price", 0);
                set("discountPrice", null);
                set("discountExpiry", "");

                setNested(
                  "installments",
                  "enabled",
                  false
                );
              }}
              className={`p-4 rounded-xl border text-left transition ${
                form.isFree
                  ? "bg-orange/10 border-orange text-text"
                  : "bg-surfaceHigh border-border text-muted hover:text-text"
              }`}
            >
              <p className="font-semibold text-sm">
                Free Course
              </p>

              <p className="text-xs text-muted mt-1">
                Students can enroll without payment.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                set("isFree", false)
              }
              className={`p-4 rounded-xl border text-left transition ${
                !form.isFree
                  ? "bg-orange/10 border-orange text-text"
                  : "bg-surfaceHigh border-border text-muted hover:text-text"
              }`}
            >
              <p className="font-semibold text-sm">
                Paid Course
              </p>

              <p className="text-xs text-muted mt-1">
                Students must pay to enroll.
              </p>
            </button>
          </div>
        </div>

        {!form.isFree && (
          <>
            {/* PRICE */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Course Price (₦) *"
                type="number"
                min="0"
                value={form.price}
                onChange={(e) =>
                  set(
                    "price",
                    e.target.value
                  )
                }
                placeholder="e.g. 150000"
              />

              <Input
                label="Discount Price (₦)"
                type="number"
                min="0"
                value={
                  form.discountPrice ?? ""
                }
                onChange={(e) =>
                  set(
                    "discountPrice",
                    e.target.value
                  )
                }
                placeholder="e.g. 120000"
              />
            </div>

            <Input
              label="Discount Expiry"
              type="date"
              value={form.discountExpiry}
              onChange={(e) =>
                set(
                  "discountExpiry",
                  e.target.value
                )
              }
            />

            {/* INSTALLMENTS */}

            <div className="border border-border rounded-2xl p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-text">
                    Installment Payments
                  </h3>

                  <p className="text-xs text-muted mt-1">
                    Allow students to pay for the course in installments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNested(
                      "installments",
                      "enabled",
                      !form.installments.enabled
                    )
                  }
                  className={`relative w-11 h-6 rounded-full transition ${
                    form.installments.enabled
                      ? "bg-orange"
                      : "bg-surfaceHigh border border-border"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${
                      form.installments.enabled
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>

              {form.installments.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Installment Amount (₦)"
                    type="number"
                    min="0"
                    value={
                      form.installments.amount
                    }
                    onChange={(e) =>
                      setNested(
                        "installments",
                        "amount",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 50000"
                  />

                  <Input
                    label="Number of Payments"
                    type="number"
                    min="1"
                    value={
                      form.installments.count
                    }
                    onChange={(e) =>
                      setNested(
                        "installments",
                        "count",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 3"
                  />

                  <Select
                    label="Interval"
                    value={
                      form.installments.interval
                    }
                    onChange={(e) =>
                      setNested(
                        "installments",
                        "interval",
                        e.target.value
                      )
                    }
                    options={[
                      {
                        value: "weekly",
                        label: "Weekly",
                      },
                      {
                        value: "monthly",
                        label: "Monthly",
                      },
                    ]}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // ==========================================================
  // STEP 5
  // ==========================================================

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="dsp text-lg font-bold text-text">
            Settings & Live Classes
          </h2>

          <p className="text-muted text-sm mt-1">
            Configure enrollment, student features and live teaching.
          </p>
        </div>

        {/* COURSE SETTINGS */}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text">
            Course Settings
          </h3>

          <Select
            label="Enrollment Type"
            value={
              form.settings.enrollmentType
            }
            onChange={(e) =>
              setNested(
                "settings",
                "enrollmentType",
                e.target.value
              )
            }
            options={[
              {
                value: "open",
                label: "Open Enrollment",
              },
              {
                value: "invite",
                label: "Invite Only",
              },
            ]}
          />

          <div className="space-y-2">
            {/* CERTIFICATE */}

            <SettingToggle
              label="Certificate"
              description="Issue a certificate when students complete the course."
              checked={
                form.settings.hasCertificate
              }
              onChange={(value) =>
                setNested(
                  "settings",
                  "hasCertificate",
                  value
                )
              }
            />

            {/* DISCUSSION */}

            <SettingToggle
              label="Discussion"
              description="Allow students to participate in course discussions."
              checked={
                form.settings.hasDiscussion
              }
              onChange={(value) =>
                setNested(
                  "settings",
                  "hasDiscussion",
                  value
                )
              }
            />

            {/* DRIP */}

            <SettingToggle
              label="Drip Content"
              description="Release course content gradually over time."
              checked={
                form.settings.dripContent
              }
              onChange={(value) =>
                setNested(
                  "settings",
                  "dripContent",
                  value
                )
              }
            />

            {/* DOWNLOADS */}

            <SettingToggle
              label="Allow Downloads"
              description="Allow students to download permitted course resources."
              checked={
                form.settings.allowDownloads
              }
              onChange={(value) =>
                setNested(
                  "settings",
                  "allowDownloads",
                  value
                )
              }
            />
          </div>
        </div>

        {/* LIVE CLASSES */}

        <div className="border border-border rounded-2xl p-4 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-text">
                Live Classes
              </h3>

              <p className="text-xs text-muted mt-1">
                Schedule live teaching sessions for students.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setNested(
                  "liveClasses",
                  "enabled",
                  !form.liveClasses.enabled
                )
              }
              className={`relative w-11 h-6 rounded-full transition ${
                form.liveClasses.enabled
                  ? "bg-orange"
                  : "bg-surfaceHigh border border-border"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${
                  form.liveClasses.enabled
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {form.liveClasses.enabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Frequency"
                  value={
                    form.liveClasses.frequency
                  }
                  onChange={(e) =>
                    setNested(
                      "liveClasses",
                      "frequency",
                      e.target.value
                    )
                  }
                  options={[
                    {
                      value: "once",
                      label: "Once",
                    },
                    {
                      value: "weekly",
                      label: "Weekly",
                    },
                    {
                      value: "twice-weekly",
                      label: "Twice Weekly",
                    },
                    {
                      value: "three-times-weekly",
                      label: "Three Times Weekly",
                    },
                    {
                      value: "custom",
                      label: "Custom",
                    },
                  ]}
                />

                <Input
                  label="Duration (minutes)"
                  type="number"
                  min="15"
                  value={
                    form.liveClasses.duration
                  }
                  onChange={(e) =>
                    setNested(
                      "liveClasses",
                      "duration",
                      e.target.value
                    )
                  }
                  placeholder="60"
                />
              </div>

              <Select
                label="Platform"
                value={
                  form.liveClasses.platform
                }
                onChange={(e) =>
                  setNested(
                    "liveClasses",
                    "platform",
                    e.target.value
                  )
                }
                options={[
                  {
                    value: "google-meet",
                    label: "Google Meet",
                  },
                  {
                    value: "zoom",
                    label: "Zoom",
                  },
                  {
                    value: "microsoft-teams",
                    label: "Microsoft Teams",
                  },
                  {
                    value: "other",
                    label: "Other",
                  },
                ]}
              />

              <Textarea
                label="Live Class Description"
                value={
                  form.liveClasses.description
                }
                onChange={(e) =>
                  setNested(
                    "liveClasses",
                    "description",
                    e.target.value
                  )
                }
                placeholder="Describe how your live classes will work..."
                rows={4}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==========================================================
  // CURRENT STEP
  // ==========================================================

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderBasicInformation();

      case 2:
        return renderClassification();

      case 3:
        return renderLearning();

      case 4:
        return renderPricing();

      case 5:
        return renderSettings();

      default:
        return null;
    }
  };

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="space-y-5 fi max-w-4xl pb-8">
      {/* HEADER */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate("/instructor/courses")
          }
          className="text-muted hover:text-text transition text-sm"
        >
          ← Back
        </button>

        <div>
          <h1 className="dsp text-xl font-bold text-text">
            Create New Course
          </h1>

          <p className="text-muted text-sm mt-1">
            Set up your course before adding modules, lessons and projects.
          </p>
        </div>
      </div>

      {/* STEP INDICATOR */}

      {renderStepIndicator()}

      {/* CURRENT STEP */}

      <div className="bg-surface border border-border rounded-2xl p-5 md:p-6">
        {renderCurrentStep()}
      </div>

      {/* NAVIGATION */}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={
            step === 1
              ? () =>
                  navigate(
                    "/instructor/courses"
                  )
              : handleBack
          }
          disabled={creating}
          className="px-5 py-3 bg-surfaceHigh border border-border text-text font-semibold rounded-xl text-sm hover:border-orange/40 transition disabled:opacity-50"
        >
          {step === 1 ? "Cancel" : "← Previous"}
        </button>

        <div className="text-xs text-muted">
          Step {step} of {STEPS.length}
        </div>

        {step < STEPS.length ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={creating}
            className="px-6 py-3 bg-orange hover:bg-orange/90 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50"
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="px-6 py-3 bg-orange hover:bg-orange/90 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50"
          >
            {creating
              ? "Creating..."
              : "Create Course →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SETTING TOGGLE
// ============================================================

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-surfaceHigh border border-border">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text">
          {label}
        </p>

        <p className="text-xs text-muted mt-1">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!checked)
        }
        className={`relative w-11 h-6 shrink-0 rounded-full transition ${
          checked
            ? "bg-orange"
            : "bg-surface border border-border"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}


