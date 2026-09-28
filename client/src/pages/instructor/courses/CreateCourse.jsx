import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleDollarSign,
  FileText,
  GraduationCap,
  Layers3,
  Lightbulb,
  Loader2,
  Plus,
  Settings2,
  Tags,
  Trash2,
  Video,
  X,
} from "lucide-react";

import {
  createCourse,
} from "../../../services/instructor/courseService";

import {
  getInstructorCategories,
} from "../../../services/instructor/categoryService";

import Input from "../../../components/common/Input";
import Textarea from "../../../components/common/Textarea";
import Select from "../../../components/common/Select";

// ============================================================
// STEPS
// ============================================================

const STEPS = [
  {
    number: 1,
    title: "Basic Information",
    shortTitle: "Basics",
    description:
      "Tell students what your course is about.",
    icon: FileText,
  },
  {
    number: 2,
    title: "Classification",
    shortTitle: "Classification",
    description:
      "Organize your course and define its technologies.",
    icon: Tags,
  },
  {
    number: 3,
    title: "Learning",
    shortTitle: "Learning",
    description:
      "Define prerequisites and learning outcomes.",
    icon: Lightbulb,
  },
  {
    number: 4,
    title: "Pricing",
    shortTitle: "Pricing",
    description:
      "Configure your course pricing and installments.",
    icon: CircleDollarSign,
  },
  {
    number: 5,
    title: "Settings & Live Classes",
    shortTitle: "Settings",
    description:
      "Configure enrollment, certificates and live classes.",
    icon: Settings2,
  },
];

// ============================================================
// INITIAL FORM
// ============================================================

const INITIAL_FORM = {
  // STEP 1
  title: "",
  subtitle: "",
  shortDescription: "",
  description: "",

  // STEP 2
  category: "",
  level: "beginner",
  language: "English",
  tags: [],
  technologies: [],

  // STEP 3
  prerequisites: [],
  learningOutcomes: [],

  // STEP 4
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

  // STEP 5
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
};

// ============================================================
// COMPONENT
// ============================================================

export default function CreateCourse() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  // ==========================================================
  // ARRAY INPUTS
  // ==========================================================

  const [tagInput, setTagInput] = useState("");
  const [technologyInput, setTechnologyInput] =
    useState("");
  const [prerequisiteInput, setPrerequisiteInput] =
    useState("");
  const [outcomeInput, setOutcomeInput] = useState("");

  // ==========================================================
  // FETCH ACTIVE CATEGORIES
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      setCategoriesLoading(true);

      try {
        const response =
          await getInstructorCategories();

        if (!mounted) return;

        setCategories(
          response.data?.data || []
        );
      } catch (error) {
        if (!mounted) return;

        setCategories([]);

        toast.error(
          error.response?.data?.message ||
            "Failed to load course categories"
        );
      } finally {
        if (mounted) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================
  // GENERIC SETTERS
  // ==========================================================

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const setNested = (
    parent,
    key,
    value
  ) => {
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

  const addItem = (
    key,
    value,
    setter
  ) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return;
    }

    const exists = form[key].some(
      (item) =>
        item.toLowerCase() ===
        trimmed.toLowerCase()
    );

    if (exists) {
      toast.error(
        "This item has already been added"
      );
      return;
    }

    set(key, [
      ...form[key],
      trimmed,
    ]);

    setter("");
  };

  const removeItem = (
    key,
    index
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter(
        (_, i) => i !== index
      ),
    }));
  };

  // ==========================================================
  // STEP VALIDATION
  // ==========================================================

  const validateStep = (
    currentStep
  ) => {
    if (currentStep === 1) {
      if (!form.title.trim()) {
        toast.error(
          "Course title is required"
        );
        return false;
      }

      if (
        form.title.trim().length < 5
      ) {
        toast.error(
          "Course title must be at least 5 characters"
        );
        return false;
      }

      if (!form.description.trim()) {
        toast.error(
          "Course description is required"
        );
        return false;
      }

      if (
        form.description.trim().length <
        20
      ) {
        toast.error(
          "Course description must be at least 20 characters"
        );
        return false;
      }

      return true;
    }

    if (currentStep === 2) {
      if (!form.category) {
        toast.error(
          "Course category is required"
        );
        return false;
      }

      return true;
    }

    if (currentStep === 3) {
      if (
        form.learningOutcomes.length ===
        0
      ) {
        toast.error(
          "Add at least one learning outcome"
        );
        return false;
      }

      return true;
    }

    if (currentStep === 4) {
      if (!form.isFree) {
        const price = Number(
          form.price
        );

        if (
          !Number.isFinite(price) ||
          price <= 0
        ) {
          toast.error(
            "Enter a valid course price"
          );
          return false;
        }

        if (
          form.discountPrice !== null &&
          form.discountPrice !== "" &&
          Number(form.discountPrice) >=
            price
        ) {
          toast.error(
            "Discount price must be lower than the original price"
          );
          return false;
        }

        if (
          form.installments.enabled &&
          Number(
            form.installments.amount
          ) <= 0
        ) {
          toast.error(
            "Enter a valid installment amount"
          );
          return false;
        }

        if (
          form.installments.enabled &&
          Number(
            form.installments.count
          ) <= 0
        ) {
          toast.error(
            "Enter a valid installment count"
          );
          return false;
        }
      }

      return true;
    }

    if (currentStep === 5) {
      if (
        form.liveClasses.enabled
      ) {
        if (
          Number(
            form.liveClasses.duration
          ) < 15
        ) {
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

    setStep((prev) =>
      Math.min(
        prev + 1,
        STEPS.length
      )
    );
  };

  // ==========================================================
  // BACK
  // ==========================================================

  const handleBack = () => {
    setStep((prev) =>
      Math.max(prev - 1, 1)
    );
  };

  // ==========================================================
  // STEP CLICK
  // ==========================================================

  const handleStepClick = (
    targetStep
  ) => {
    if (creating) return;

    if (targetStep < step) {
      setStep(targetStep);
    }
  };

  // ==========================================================
  // CREATE COURSE
  // ==========================================================

  const handleCreate = async () => {
    if (!validateStep(5)) {
      return;
    }

    const payload = {
      // BASIC INFORMATION
      title: form.title.trim(),

      subtitle:
        form.subtitle.trim() ||
        null,

      shortDescription:
        form.shortDescription.trim() ||
        null,

      description:
        form.description.trim(),

      // CLASSIFICATION
      category: form.category,

      level: form.level,

      language: form.language,

      tags: form.tags,

      technologies:
        form.technologies,

      // LEARNING
      prerequisites:
        form.prerequisites,

      learningOutcomes:
        form.learningOutcomes,

      // PRICING
      isFree: form.isFree,

      price: form.isFree
        ? 0
        : Number(form.price),

      discountPrice:
        form.isFree ||
        form.discountPrice === "" ||
        form.discountPrice === null
          ? null
          : Number(
              form.discountPrice
            ),

      discountExpiry:
        form.isFree ||
        !form.discountExpiry
          ? null
          : form.discountExpiry,

      installments: {
        enabled: form.isFree
          ? false
          : form.installments
              .enabled,

        amount: form.isFree
          ? 0
          : Number(
              form.installments
                .amount || 0
            ),

        count: form.isFree
          ? 0
          : Number(
              form.installments
                .count || 0
            ),

        interval:
          form.installments.interval,
      },

      // SETTINGS
      settings: {
        enrollmentType:
          form.settings
            .enrollmentType,

        hasCertificate:
          form.settings
            .hasCertificate,

        hasDiscussion:
          form.settings
            .hasDiscussion,

        dripContent:
          form.settings
            .dripContent,

        allowDownloads:
          form.settings
            .allowDownloads,
      },

      // LIVE CLASSES
      liveClasses: {
        enabled:
          form.liveClasses
            .enabled,

        frequency:
          form.liveClasses
            .frequency,

        duration: Number(
          form.liveClasses
            .duration
        ),

        platform:
          form.liveClasses
            .platform,

        description:
          form.liveClasses
            .description.trim() ||
          null,
      },
    };

    setCreating(true);

    try {
      const response =
        await createCourse(
          payload
        );

      const course =
        response.data?.data;

      if (!course?._id) {
        throw new Error(
          "Course was created but no course ID was returned"
        );
      }

      toast.success(
        "Course created successfully"
      );

      navigate(
        `/instructor/courses/${course._id}/build`
      );
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          error.message ||
          "Failed to create course"
      );
    } finally {
      setCreating(false);
    }
  };

  // ==========================================================
  // STEP INDICATOR
  // ==========================================================

  const renderStepIndicator = () => {
    return (
      <div className="bg-surface border border-border rounded-2xl p-4 md:p-5">
        {/* DESKTOP */}
        <div className="hidden md:flex items-start">
          {STEPS.map(
            (item, index) => {
              const Icon = item.icon;

              const active =
                step === item.number;

              const completed =
                step > item.number;

              const accessible =
                item.number <= step;

              return (
                <div
                  key={item.number}
                  className="flex items-start flex-1 last:flex-none"
                >
                  <div className="flex flex-col items-center min-w-[100px]">
                    <button
                      type="button"
                      onClick={() =>
                        handleStepClick(
                          item.number
                        )
                      }
                      disabled={
                        !accessible ||
                        creating
                      }
                      className={`group flex flex-col items-center ${
                        accessible
                          ? "cursor-pointer"
                          : "cursor-default"
                      }`}
                    >
                      <div className="relative flex items-center justify-center">
                        <div
                          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                            active
                              ? "bg-orange border-orange text-white shadow-lg shadow-orange/20"
                              : completed
                              ? "bg-orange/10 border-orange/40 text-orange"
                              : "bg-surfaceHigh border-border text-muted"
                          }`}
                        >
                          {completed ? (
                            <Check
                              size={17}
                              strokeWidth={
                                2.5
                              }
                            />
                          ) : (
                            <Icon size={17} />
                          )}
                        </div>
                      </div>

                      <span
                        className={`mt-2 text-xs font-semibold text-center transition ${
                          active
                            ? "text-text"
                            : completed
                            ? "text-orange"
                            : "text-muted"
                        }`}
                      >
                        {
                          item.shortTitle
                        }
                      </span>

                      <span className="text-[10px] text-muted mt-0.5">
                        Step{" "}
                        {
                          item.number
                        }
                      </span>
                    </button>
                  </div>

                  {index <
                    STEPS.length -
                      1 && (
                    <div className="flex-1 px-2 pt-5">
                      <div
                        className={`h-0.5 rounded-full transition ${
                          step >
                          item.number
                            ? "bg-orange/50"
                            : "bg-border"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>

        {/* MOBILE */}
        <div className="md:hidden">
          <div className="flex items-center gap-3">
            {STEPS.map(
              (item) => {
                const completed =
                  step >
                  item.number;

                const active =
                  step ===
                  item.number;

                return (
                  <div
                    key={
                      item.number
                    }
                    className="flex-1"
                  >
                    <div
                      className={`h-1 rounded-full transition ${
                        active
                          ? "bg-orange"
                          : completed
                          ? "bg-orange/50"
                          : "bg-border"
                      }`}
                    />
                  </div>
                );
              }
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              {(() => {
                const Icon =
                  STEPS[
                    step - 1
                  ].icon;

                return (
                  <div className="w-9 h-9 rounded-xl bg-orange/10 border border-orange/20 text-orange flex items-center justify-center">
                    <Icon size={17} />
                  </div>
                );
              })()}

              <div>
                <p className="text-sm font-semibold text-text">
                  {
                    STEPS[
                      step - 1
                    ].title
                  }
                </p>

                <p className="text-[11px] text-muted mt-0.5">
                  Step {step} of{" "}
                  {
                    STEPS.length
                  }
                </p>
              </div>
            </div>

            <div className="text-xs font-medium text-muted">
              {Math.round(
                (step /
                  STEPS.length) *
                  100
              )}
              %
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================
  // STEP HEADER
  // ==========================================================

  const renderStepHeader = (
    title,
    description,
    Icon
  ) => {
    return (
      <div className="flex items-start gap-3 pb-5 border-b border-border">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-orange/10 border border-orange/20 text-orange flex items-center justify-center">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="dsp text-lg font-bold text-text">
            {title}
          </h2>

          <p className="text-muted text-sm mt-1 leading-6">
            {description}
          </p>
        </div>
      </div>
    );
  };

  // ==========================================================
  // STEP 1
  // ==========================================================

  const renderBasicInformation =
    () => {
      return (
        <div className="space-y-5">
          {renderStepHeader(
            "Basic Information",
            "Information students will see when they discover your course.",
            FileText
          )}

          <Input
            label="Course Title *"
            value={form.title}
            onChange={(e) =>
              set(
                "title",
                e.target.value
              )
            }
            placeholder="e.g. Complete React Development Course"
            required
          />

          <Input
            label="Subtitle"
            value={form.subtitle}
            onChange={(e) =>
              set(
                "subtitle",
                e.target.value
              )
            }
            placeholder="A short supporting statement for your course"
          />

          <Input
            label="Short Description"
            value={
              form.shortDescription
            }
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
            value={
              form.description
            }
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

  const renderClassification =
    () => {
      const categoryOptions =
        categories.map(
          (category) => ({
            value: category._id,
            label: category.name,
          })
        );

      return (
        <div className="space-y-6">
          {renderStepHeader(
            "Classification",
            "Help students understand the level, category and technologies covered by this course.",
            Tags
          )}

          <div className="space-y-2">
            <Select
              label="Course Category *"
              value={
                form.category
              }
              onChange={(e) =>
                set(
                  "category",
                  e.target.value
                )
              }
              options={[
                {
                  value: "",
                  label:
                    categoriesLoading
                      ? "Loading categories..."
                      : categories.length ===
                        0
                      ? "No categories available"
                      : "Select a category",
                },
                ...categoryOptions,
              ]}
              disabled={
                categoriesLoading ||
                categories.length ===
                  0
              }
            />

            {categories.length ===
              0 &&
              !categoriesLoading && (
                <p className="text-xs text-red-400">
                  No active categories
                  are available.
                  Contact the Super
                  Admin to create a
                  category.
                </p>
              )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Level"
              value={form.level}
              onChange={(e) =>
                set(
                  "level",
                  e.target.value
                )
              }
              options={[
                {
                  value: "beginner",
                  label: "Beginner",
                },
                {
                  value:
                    "intermediate",
                  label:
                    "Intermediate",
                },
                {
                  value: "advanced",
                  label: "Advanced",
                },
              ]}
            />

            <Select
              label="Language"
              value={
                form.language
              }
              onChange={(e) =>
                set(
                  "language",
                  e.target.value
                )
              }
              options={[
                {
                  value: "English",
                  label: "English",
                },
                {
                  value: "Pidgin",
                  label:
                    "Pidgin English",
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

          <ArrayField
            title="Technologies"
            description="Add technologies and tools students will use."
            value={
              technologyInput
            }
            setValue={
              setTechnologyInput
            }
            placeholder="e.g. React"
            items={
              form.technologies
            }
            onAdd={() =>
              addItem(
                "technologies",
                technologyInput,
                setTechnologyInput
              )
            }
            onRemove={(index) =>
              removeItem(
                "technologies",
                index
              )
            }
          />

          <ArrayField
            title="Course Tags"
            description="Add keywords that help identify your course."
            value={tagInput}
            setValue={
              setTagInput
            }
            placeholder="e.g. javascript"
            items={form.tags}
            onAdd={() =>
              addItem(
                "tags",
                tagInput,
                setTagInput
              )
            }
            onRemove={(index) =>
              removeItem(
                "tags",
                index
              )
            }
            accent="orange"
            prefix="#"
          />
        </div>
      );
    };

  // ==========================================================
  // STEP 3
  // ==========================================================

  const renderLearning =
    () => {
      return (
        <div className="space-y-6">
          {renderStepHeader(
            "Learning",
            "Define what students should know before starting and what they should be able to accomplish after completing the course.",
            Lightbulb
          )}

          <ArrayField
            title="Prerequisites"
            description="What should students know or have before starting?"
            value={
              prerequisiteInput
            }
            setValue={
              setPrerequisiteInput
            }
            placeholder="e.g. Basic JavaScript knowledge"
            items={
              form.prerequisites
            }
            onAdd={() =>
              addItem(
                "prerequisites",
                prerequisiteInput,
                setPrerequisiteInput
              )
            }
            onRemove={(index) =>
              removeItem(
                "prerequisites",
                index
              )
            }
            listStyle="card"
          />

          <ArrayField
            title="Learning Outcomes *"
            description="What should students be able to do after completing this course?"
            value={outcomeInput}
            setValue={
              setOutcomeInput
            }
            placeholder="e.g. Build production-ready React applications"
            items={
              form.learningOutcomes
            }
            onAdd={() =>
              addItem(
                "learningOutcomes",
                outcomeInput,
                setOutcomeInput
              )
            }
            onRemove={(index) =>
              removeItem(
                "learningOutcomes",
                index
              )
            }
            listStyle="card"
            accent="orange"
          />
        </div>
      );
    };

  // ==========================================================
  // STEP 4
  // ==========================================================

  const renderPricing =
    () => {
      return (
        <div className="space-y-6">
          {renderStepHeader(
            "Pricing",
            "Configure how students will pay for this course.",
            CircleDollarSign
          )}

          <div className="space-y-3">
            <label className="block text-sm font-medium text-text">
              Course Type
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CourseTypeCard
                active={form.isFree}
                title="Free Course"
                description="Students can enroll without payment."
                icon={BookOpen}
                onClick={() => {
                  set(
                    "isFree",
                    true
                  );

                  set(
                    "price",
                    0
                  );

                  set(
                    "discountPrice",
                    null
                  );

                  set(
                    "discountExpiry",
                    ""
                  );

                  setNested(
                    "installments",
                    "enabled",
                    false
                  );
                }}
              />

              <CourseTypeCard
                active={!form.isFree}
                title="Paid Course"
                description="Students must pay to enroll."
                icon={
                  CircleDollarSign
                }
                onClick={() =>
                  set(
                    "isFree",
                    false
                  )
                }
              />
            </div>
          </div>

          {!form.isFree && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Course Price (₦) *"
                  type="number"
                  min="0"
                  value={
                    form.price
                  }
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
                    form.discountPrice ??
                    ""
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
                value={
                  form.discountExpiry
                }
                onChange={(e) =>
                  set(
                    "discountExpiry",
                    e.target.value
                  )
                }
              />

              <div className="border border-border rounded-2xl p-4 md:p-5 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange/10 text-orange flex items-center justify-center">
                      <Layers3
                        size={17}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-text">
                        Installment
                        Payments
                      </h3>

                      <p className="text-xs text-muted mt-1">
                        Allow students
                        to pay for the
                        course in
                        installments.
                      </p>
                    </div>
                  </div>

                  <Toggle
                    checked={
                      form
                        .installments
                        .enabled
                    }
                    onChange={(
                      value
                    ) =>
                      setNested(
                        "installments",
                        "enabled",
                        value
                      )
                    }
                  />
                </div>

                {form.installments
                  .enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Installment Amount (₦)"
                      type="number"
                      min="0"
                      value={
                        form
                          .installments
                          .amount
                      }
                      onChange={(e) =>
                        setNested(
                          "installments",
                          "amount",
                          e.target
                            .value
                        )
                      }
                      placeholder="e.g. 50000"
                    />

                    <Input
                      label="Number of Payments"
                      type="number"
                      min="1"
                      value={
                        form
                          .installments
                          .count
                      }
                      onChange={(e) =>
                        setNested(
                          "installments",
                          "count",
                          e.target
                            .value
                        )
                      }
                      placeholder="e.g. 3"
                    />

                    <Select
                      label="Interval"
                      value={
                        form
                          .installments
                          .interval
                      }
                      onChange={(e) =>
                        setNested(
                          "installments",
                          "interval",
                          e.target
                            .value
                        )
                      }
                      options={[
                        {
                          value:
                            "weekly",
                          label:
                            "Weekly",
                        },
                        {
                          value:
                            "monthly",
                          label:
                            "Monthly",
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

  const renderSettings =
    () => {
      return (
        <div className="space-y-6">
          {renderStepHeader(
            "Settings & Live Classes",
            "Configure enrollment, student features and live teaching.",
            Settings2
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings2
                size={16}
                className="text-orange"
              />

              <h3 className="text-sm font-semibold text-text">
                Course Settings
              </h3>
            </div>

            <Select
              label="Enrollment Type"
              value={
                form.settings
                  .enrollmentType
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
                  label:
                    "Open Enrollment",
                },
                {
                  value: "invite",
                  label:
                    "Invite Only",
                },
              ]}
            />

            <div className="space-y-2">
              <SettingToggle
                label="Certificate"
                description="Issue a certificate when students complete the course."
                checked={
                  form.settings
                    .hasCertificate
                }
                onChange={(value) =>
                  setNested(
                    "settings",
                    "hasCertificate",
                    value
                  )
                }
              />

              <SettingToggle
                label="Discussion"
                description="Allow students to participate in course discussions."
                checked={
                  form.settings
                    .hasDiscussion
                }
                onChange={(value) =>
                  setNested(
                    "settings",
                    "hasDiscussion",
                    value
                  )
                }
              />

              <SettingToggle
                label="Drip Content"
                description="Release course content gradually over time."
                checked={
                  form.settings
                    .dripContent
                }
                onChange={(value) =>
                  setNested(
                    "settings",
                    "dripContent",
                    value
                  )
                }
              />

              <SettingToggle
                label="Allow Downloads"
                description="Allow students to download permitted course resources."
                checked={
                  form.settings
                    .allowDownloads
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

          <div className="border border-border rounded-2xl p-4 md:p-5 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange/10 text-orange flex items-center justify-center">
                  <Video
                    size={17}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-text">
                    Live Classes
                  </h3>

                  <p className="text-xs text-muted mt-1">
                    Schedule live teaching
                    sessions for students.
                  </p>
                </div>
              </div>

              <Toggle
                checked={
                  form.liveClasses
                    .enabled
                }
                onChange={(value) =>
                  setNested(
                    "liveClasses",
                    "enabled",
                    value
                  )
                }
              />
            </div>

            {form.liveClasses
              .enabled && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Frequency"
                    value={
                      form
                        .liveClasses
                        .frequency
                    }
                    onChange={(e) =>
                      setNested(
                        "liveClasses",
                        "frequency",
                        e.target
                          .value
                      )
                    }
                    options={[
                      {
                        value:
                          "once",
                        label:
                          "Once",
                      },
                      {
                        value:
                          "weekly",
                        label:
                          "Weekly",
                      },
                      {
                        value:
                          "twice-weekly",
                        label:
                          "Twice Weekly",
                      },
                      {
                        value:
                          "three-times-weekly",
                        label:
                          "Three Times Weekly",
                      },
                      {
                        value:
                          "custom",
                        label:
                          "Custom",
                      },
                    ]}
                  />

                  <Input
                    label="Duration (minutes)"
                    type="number"
                    min="15"
                    value={
                      form
                        .liveClasses
                        .duration
                    }
                    onChange={(e) =>
                      setNested(
                        "liveClasses",
                        "duration",
                        e.target
                          .value
                      )
                    }
                    placeholder="60"
                  />
                </div>

                <Select
                  label="Platform"
                  value={
                    form
                      .liveClasses
                      .platform
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
                      value:
                        "google-meet",
                      label:
                        "Google Meet",
                    },
                    {
                      value: "zoom",
                      label: "Zoom",
                    },
                    {
                      value:
                        "microsoft-teams",
                      label:
                        "Microsoft Teams",
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
                    form
                      .liveClasses
                      .description
                  }
                  onChange={(e) =>
                    setNested(
                      "liveClasses",
                      "description",
                      e.target
                        .value
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

  const renderCurrentStep =
    () => {
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
    <div className="space-y-5 fi max-w-5xl pb-8">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/instructor/courses"
              )
            }
            disabled={creating}
            className="w-9 h-9 shrink-0 rounded-xl bg-surface border border-border text-muted hover:text-text hover:border-orange/40 transition flex items-center justify-center"
            title="Back to courses"
          >
            <ArrowLeft
              size={17}
            />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="dsp text-xl md:text-2xl font-bold text-text">
                Create New Course
              </h1>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange/10 border border-orange/20 text-orange text-[10px] font-semibold">
                <GraduationCap
                  size={12}
                />
                Instructor
              </span>
            </div>

            <p className="text-muted text-sm mt-1">
              Set up your course before
              adding modules, lessons and
              projects.
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border">
          <BookOpen
            size={15}
            className="text-orange"
          />

          <span className="text-xs text-muted">
            Course setup
          </span>

          <ChevronRight
            size={13}
            className="text-muted"
          />

          <span className="text-xs font-medium text-text">
            {Math.round(
              (step /
                STEPS.length) *
                100
            )}
            % complete
          </span>
        </div>
      </div>

      {/* STEP INDICATOR */}

      {renderStepIndicator()}

      {/* CURRENT STEP */}

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="p-5 md:p-7">
          {renderCurrentStep()}
        </div>
      </div>

      {/* NAVIGATION */}

      <div className="bg-surface border border-border rounded-2xl p-4 md:p-5">
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
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-surfaceHigh border border-border text-text font-semibold rounded-xl text-sm hover:border-orange/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft
              size={16}
            />

            {step === 1
              ? "Cancel"
              : "Previous"}
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted">
            <span>Step</span>

            <span className="font-semibold text-text">
              {step}
            </span>

            <span>of</span>

            <span className="font-semibold text-text">
              {STEPS.length}
            </span>
          </div>

          {step <
          STEPS.length ? (
            <button
              type="button"
              onClick={
                handleNext
              }
              disabled={
                creating
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange hover:bg-orange/90 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue

              <ArrowRight
                size={16}
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={
                handleCreate
              }
              disabled={
                creating
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange hover:bg-orange/90 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Creating...
                </>
              ) : (
                <>
                  Create Course

                  <Check
                    size={16}
                  />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ARRAY FIELD
// ============================================================

function ArrayField({
  title,
  description,
  value,
  setValue,
  placeholder,
  items,
  onAdd,
  onRemove,
  accent = "default",
  prefix = "",
  listStyle = "tags",
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-text">
          {title}
        </h3>

        <p className="text-xs text-muted mt-1">
          {description}
        </p>
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            label=""
            value={value}
            onChange={(e) =>
              setValue(
                e.target.value
              )
            }
            placeholder={
              placeholder
            }
          />
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="h-[46px] px-4 bg-surfaceHigh border border-border rounded-xl text-sm font-semibold text-text hover:border-orange/40 hover:text-orange transition inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {items.length > 0 && (
        <>
          {listStyle ===
          "card" ? (
            <div className="space-y-2">
              {items.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={`${item}-${index}`}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl bg-surfaceHigh border ${
                      accent ===
                      "orange"
                        ? "border-orange/20"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <div
                        className={`mt-0.5 w-5 h-5 shrink-0 rounded-full flex items-center justify-center ${
                          accent ===
                          "orange"
                            ? "bg-orange/10 text-orange"
                            : "bg-surface text-muted"
                        }`}
                      >
                        <Check
                          size={12}
                        />
                      </div>

                      <span className="text-sm text-text leading-5">
                        {item}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onRemove(
                          index
                        )
                      }
                      className="shrink-0 w-8 h-8 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10 transition flex items-center justify-center"
                      title="Remove"
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {items.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={`${item}-${index}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
                      accent ===
                      "orange"
                        ? "bg-orange/10 border-orange/20 text-orange"
                        : "bg-surfaceHigh border-border text-text"
                    }`}
                  >
                    <span>
                      {prefix}
                      {item}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        onRemove(
                          index
                        )
                      }
                      className="w-5 h-5 rounded-md flex items-center justify-center opacity-70 hover:opacity-100 transition"
                      title="Remove"
                    >
                      <X
                        size={13}
                      />
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// COURSE TYPE CARD
// ============================================================

function CourseTypeCard({
  active,
  title,
  description,
  icon: Icon,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-xl border text-left transition ${
        active
          ? "bg-orange/10 border-orange/50"
          : "bg-surfaceHigh border-border hover:border-orange/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            active
              ? "bg-orange text-white"
              : "bg-surface border border-border text-muted"
          }`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-sm text-text">
            {title}
          </p>

          <p className="text-xs text-muted mt-1 leading-5">
            {description}
          </p>
        </div>

        {active && (
          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange text-white flex items-center justify-center">
            <Check
              size={12}
              strokeWidth={3}
            />
          </div>
        )}
      </div>
    </button>
  );
}

// ============================================================
// TOGGLE
// ============================================================

function Toggle({
  checked,
  onChange,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() =>
        onChange(!checked)
      }
      className={`relative w-11 h-6 shrink-0 rounded-full transition ${
        checked
          ? "bg-orange"
          : "bg-surfaceHigh border border-border"
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

        <p className="text-xs text-muted mt-1 leading-5">
          {description}
        </p>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
}
