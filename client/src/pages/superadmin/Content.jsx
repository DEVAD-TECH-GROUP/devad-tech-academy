import { useEffect, useState } from "react";

import {
  getBlogPosts,
  createBlogPost,
  deleteBlogPost,
  getFAQs,
  createFAQ,
  deleteFAQ,
  getTestimonials,
  createTestimonial,
} from "../../services/superadmin/contentService";

import Tabs from "../../components/common/Tabs";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import EmptyState from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/Skeleton";
import { formatDate } from "../../utils/formatDate";

import { toast } from "react-hot-toast";

/* =========================================================
   DEVAD SUPERADMIN CONTENT MANAGEMENT
   ========================================================= */

const DEBUG = true;

const log = (...args) => {
  if (DEBUG) {
    console.log(
      "%c[DEVAD CONTENT]",
      "color:#8b5cf6;font-weight:bold;",
      ...args
    );
  }
};

const logInfo = (...args) => {
  if (DEBUG) {
    console.info(
      "%c[DEVAD CONTENT INFO]",
      "color:#2563eb;font-weight:bold;",
      ...args
    );
  }
};

const logSuccess = (...args) => {
  if (DEBUG) {
    console.log(
      "%c[DEVAD CONTENT SUCCESS]",
      "color:#16a34a;font-weight:bold;",
      ...args
    );
  }
};

const logWarn = (...args) => {
  if (DEBUG) {
    console.warn(
      "%c[DEVAD CONTENT WARNING]",
      "color:#d97706;font-weight:bold;",
      ...args
    );
  }
};

const logError = (...args) => {
  if (DEBUG) {
    console.error(
      "%c[DEVAD CONTENT ERROR]",
      "color:#dc2626;font-weight:bold;",
      ...args
    );
  }
};

const initialForm = {
  title: "",
  content: "",
  question: "",
  answer: "",
};

/* =========================================================
   RESPONSE NORMALIZER
   ========================================================= */

const normalizeResponseData = (response) => {
  logInfo("Normalizing API response:", response);

  if (!response) {
    logWarn("API response is undefined/null.");
    return [];
  }

  const payload = response?.data;

  logInfo("Axios response.data:", payload);

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  logWarn("Could not find an array in API response.", {
    response,
  });

  return [];
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function Content() {
  const [tab, setTab] = useState("blog");

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState(initialForm);

  const [creating, setCreating] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  /* =======================================================
     COMPONENT MOUNT
     ======================================================= */

  useEffect(() => {
    log("==========================================");
    log("CONTENT COMPONENT MOUNTED");
    log("Initial tab:", tab);
    log("==========================================");

    return () => {
      log("CONTENT COMPONENT UNMOUNTED");
    };
  }, []);

  /* =======================================================
     LOADERS
     ======================================================= */

  const loaders = {
    blog: getBlogPosts,
    faqs: getFAQs,
    testimonials: getTestimonials,
  };

  /* =======================================================
     LOAD CONTENT
     ======================================================= */

  const loadContent = async (selectedTab = tab) => {
    log("==========================================");
    log("LOAD CONTENT START");
    log("Selected tab:", selectedTab);
    log("==========================================");

    setLoading(true);

    try {
      const loader = loaders[selectedTab];

      if (!loader) {
        logError("No loader found for tab:", selectedTab);

        toast.error("Invalid content type");

        return;
      }

      logInfo(`Calling API loader for "${selectedTab}"...`);

      const response = await loader();

      logSuccess(`API request for "${selectedTab}" completed.`);

      logInfo("Full API response:", response);

      logInfo("Response status:", response?.status);

      logInfo("Response headers:", response?.headers);

      logInfo("Response data:", response?.data);

      const normalizedData = normalizeResponseData(response);

      logSuccess(
        `Normalized ${selectedTab} records:`,
        normalizedData.length
      );

      console.table(normalizedData);

      setData(normalizedData);
    } catch (error) {
      logError("==========================================");
      logError(`FAILED TO LOAD ${selectedTab.toUpperCase()}`);
      logError("==========================================");

      logError("Error object:", error);

      logError("Error message:", error?.message);

      logError("Error response:", error?.response);

      logError("Error response data:", error?.response?.data);

      logError("Error response status:", error?.response?.status);

      logError("Error response headers:", error?.response?.headers);

      logError("Error request:", error?.request);

      console.error(error);

      setData([]);

      toast.error(
        error?.response?.data?.message ||
          `Failed to load ${selectedTab}`
      );
    } finally {
      logInfo(`Finished loading "${selectedTab}".`);

      setLoading(false);
    }
  };

  /* =======================================================
     TAB CHANGE / INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    log("==========================================");
    log("TAB CHANGED");
    log("New tab:", tab);
    log("==========================================");

    loadContent(tab);
  }, [tab]);

  /* =======================================================
     HANDLE TAB CHANGE
     ======================================================= */

  const handleTabChange = (nextTab) => {
    log("User requested tab change.");

    log("Previous tab:", tab);

    log("Next tab:", nextTab);

    setTab(nextTab);

    setData([]);

    log("Cleared existing content data.");
  };

  /* =======================================================
     OPEN CREATE MODAL
     ======================================================= */

  const handleOpenCreate = () => {
    log("Opening create modal.");

    log("Current tab:", tab);

    setForm(initialForm);

    setShowCreate(true);

    log("Create form reset.");

    log("Create modal opened.");
  };

  /* =======================================================
     CLOSE CREATE MODAL
     ======================================================= */

  const handleCloseCreate = () => {
    log("Closing create modal.");

    if (creating) {
      logWarn(
        "Create operation is currently running."
      );
    }

    setShowCreate(false);

    setForm(initialForm);

    log("Create modal closed.");

    log("Form reset.");
  };

  /* =======================================================
     FORM CHANGE
     ======================================================= */

  const handleFormChange = (field, value) => {
    logInfo("Form field changed:", {
      field,
      value,
    });

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     VALIDATE FORM
     ======================================================= */

  const validateForm = () => {
    log("Validating form.");

    if (tab === "blog") {
      if (!form.title.trim()) {
        logWarn("Blog validation failed: title missing.");

        toast.error("Blog title is required.");

        return false;
      }

      if (!form.content.trim()) {
        logWarn(
          "Blog validation failed: content missing."
        );

        toast.error("Blog content is required.");

        return false;
      }
    }

    if (tab === "faqs") {
      if (!form.question.trim()) {
        logWarn(
          "FAQ validation failed: question missing."
        );

        toast.error("FAQ question is required.");

        return false;
      }

      if (!form.answer.trim()) {
        logWarn(
          "FAQ validation failed: answer missing."
        );

        toast.error("FAQ answer is required.");

        return false;
      }
    }

    logSuccess("Form validation passed.");

    return true;
  };

  /* =======================================================
     CREATE CONTENT
     ======================================================= */

  const handleCreate = async () => {
    log("==========================================");
    log("CREATE CONTENT START");
    log("==========================================");

    log("Current tab:", tab);

    log("Current form:", form);

    if (!validateForm()) {
      logWarn("Create aborted because validation failed.");

      return;
    }

    setCreating(true);

    try {
      let response;

      /* ---------------------------------------------------
         BLOG
         --------------------------------------------------- */

      if (tab === "blog") {
        const payload = {
          title: form.title.trim(),
          content: form.content.trim(),
          status: "published",
        };

        log("Creating BLOG POST.");

        log("BLOG payload:", payload);

        response = await createBlogPost(payload);
      }

      /* ---------------------------------------------------
         FAQ
         --------------------------------------------------- */

      else if (tab === "faqs") {
        const payload = {
          question: form.question.trim(),
          answer: form.answer.trim(),
        };

        log("Creating FAQ.");

        log("FAQ payload:", payload);

        response = await createFAQ(payload);
      }

      /* ---------------------------------------------------
         TESTIMONIAL
         --------------------------------------------------- */

      else if (tab === "testimonials") {
        const payload = {
          studentName: form.title.trim(),
          testimonial: form.content.trim(),
        };

        log("Creating TESTIMONIAL.");

        log("TESTIMONIAL payload:", payload);

        response = await createTestimonial(payload);
      }

      /* ---------------------------------------------------
         UNKNOWN TAB
         --------------------------------------------------- */

      else {
        logError(
          "Cannot create content. Unknown tab:",
          tab
        );

        throw new Error(
          `Unsupported content type: ${tab}`
        );
      }

      /* ---------------------------------------------------
         API RESPONSE
         --------------------------------------------------- */

      logSuccess("CREATE API REQUEST SUCCESS.");

      log("Full create response:", response);

      log("Response status:", response?.status);

      log("Response data:", response?.data);

      const createdItem =
        response?.data?.data?.data ||
        response?.data?.data ||
        response?.data?.item ||
        response?.data;

      log("Extracted created item:", createdItem);

      if (!createdItem || typeof createdItem !== "object") {
        logWarn(
          "Created item could not be extracted from response."
        );

        toast.success("Content created, but response format was unexpected.");

        await loadContent(tab);

        handleCloseCreate();

        return;
      }

      /* ---------------------------------------------------
         UPDATE UI
         --------------------------------------------------- */

      setData((previousData) => {
        log(
          "Adding newly created item to frontend state."
        );

        log("Previous data:", previousData);

        const updatedData = [
          createdItem,
          ...previousData,
        ];

        log("Updated data:", updatedData);

        return updatedData;
      });

      /* ---------------------------------------------------
         CLOSE / RESET
         --------------------------------------------------- */

      handleCloseCreate();

      toast.success("Created successfully! ✅");

      logSuccess("==========================================");
      logSuccess("CREATE CONTENT FINISHED SUCCESSFULLY");
      logSuccess("==========================================");
    } catch (error) {
      logError("==========================================");
      logError("CREATE CONTENT FAILED");
      logError("==========================================");

      logError("Error:", error);

      logError("Message:", error?.message);

      logError("Response:", error?.response);

      logError(
        "Response data:",
        error?.response?.data
      );

      logError(
        "Response status:",
        error?.response?.status
      );

      logError(
        "Response headers:",
        error?.response?.headers
      );

      console.error(
        "[DEVAD CONTENT CREATE ERROR]",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to create content."
      );
    } finally {
      setCreating(false);

      log("Create loading state set to false.");
    }
  };

  /* =======================================================
     DELETE CONTENT
     ======================================================= */

  const handleDelete = async (id) => {
    log("==========================================");
    log("DELETE CONTENT START");
    log("==========================================");

    log("Tab:", tab);

    log("Content ID:", id);

    if (!id) {
      logError(
        "Delete aborted: content ID is missing."
      );

      toast.error("Invalid content ID.");

      return;
    }

    const itemToDelete = data.find(
      (item) => item._id === id
    );

    log("Item selected for deletion:", itemToDelete);

    const confirmed = window.confirm(
      "Are you sure you want to delete this content?"
    );

    if (!confirmed) {
      log("User cancelled deletion.");

      return;
    }

    setDeletingId(id);

    try {
      let response;

      if (tab === "blog") {
        log("Calling deleteBlogPost:", id);

        response = await deleteBlogPost(id);
      } else if (tab === "faqs") {
        log("Calling deleteFAQ:", id);

        response = await deleteFAQ(id);
      } else {
        logWarn(
          "Delete is not supported for this tab:",
          tab
        );

        toast.error(
          "Delete is not available for this content type."
        );

        return;
      }

      logSuccess("DELETE API REQUEST SUCCESS.");

      log("Delete response:", response);

      log("Delete response status:", response?.status);

      log("Delete response data:", response?.data);

      setData((previousData) => {
        const updatedData = previousData.filter(
          (item) => item._id !== id
        );

        log(
          "Removed deleted item from frontend state."
        );

        log("Remaining records:", updatedData.length);

        return updatedData;
      });

      toast.success("Deleted successfully.");

      logSuccess("==========================================");
      logSuccess("DELETE CONTENT FINISHED");
      logSuccess("==========================================");
    } catch (error) {
      logError("==========================================");
      logError("DELETE CONTENT FAILED");
      logError("==========================================");

      logError("Error:", error);

      logError("Message:", error?.message);

      logError("Response:", error?.response);

      logError(
        "Response data:",
        error?.response?.data
      );

      logError(
        "Response status:",
        error?.response?.status
      );

      console.error(
        "[DEVAD CONTENT DELETE ERROR]",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to delete content."
      );
    } finally {
      setDeletingId(null);

      log("Delete loading state cleared.");
    }
  };

  /* =======================================================
     DEBUG STATE
     ======================================================= */

  useEffect(() => {
    logInfo("STATE UPDATE:", {
      tab,
      loading,
      showCreate,
      creating,
      deletingId,
      dataLength: data.length,
      form,
    });
  }, [
    tab,
    loading,
    showCreate,
    creating,
    deletingId,
    data,
    form,
  ]);

  /* =======================================================
     RENDER
     ======================================================= */

  logInfo("Rendering Content page.", {
    tab,
    loading,
    dataCount: data.length,
    showCreate,
  });

  return (
    <div className="space-y-5 fi">

      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="flex items-center justify-between gap-3">

        <div>
          <h1 className="dsp text-xl font-bold text-text">
            Content
          </h1>

          <p className="text-xs text-muted mt-1">
            Manage blog posts, FAQs and testimonials.
          </p>
        </div>

        {tab !== "testimonials" && (
          <button
            type="button"
            onClick={handleOpenCreate}
            disabled={creating}
            className="bg-purple hover:bg-purple/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            + Create
          </button>
        )}
      </div>

      {/* ===================================================
          TABS
          =================================================== */}

      <Tabs
        tabs={[
          {
            key: "blog",
            label: "Blog",
            icon: "📰",
          },
          {
            key: "faqs",
            label: "FAQs",
            icon: "❓",
          },
          {
            key: "testimonials",
            label: "Testimonials",
            icon: "💬",
          },
        ]}
        active={tab}
        onChange={handleTabChange}
      />

      {/* ===================================================
          LOADING
          =================================================== */}

      {loading ? (
        <div className="space-y-3">

          {[...Array(3)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}

        </div>
      ) : data.length === 0 ? (

        /* =================================================
           EMPTY
           ================================================= */

        <EmptyState
          icon={
            tab === "blog"
              ? "📰"
              : tab === "faqs"
              ? "❓"
              : "💬"
          }
          title={`No ${
            tab === "blog"
              ? "blog posts"
              : tab === "faqs"
              ? "FAQs"
              : "testimonials"
          }`}
          message="Create your first content."
          action={
            tab !== "testimonials"
              ? handleOpenCreate
              : undefined
          }
          actionLabel="Create"
        />

      ) : (

        /* =================================================
           CONTENT LIST
           ================================================= */

        <div className="space-y-3">

          {data.map((item) => (

            <div
              key={item._id}
              className="bg-surface border border-border rounded-2xl p-4 fi"
            >

              <div className="flex items-start justify-between gap-3">

                <div className="flex-1 min-w-0">

                  <p className="text-sm font-semibold text-text mb-1">

                    {item.title ||
                      item.question ||
                      item.studentName ||
                      "Untitled"}

                  </p>

                  {item.publishedAt && (
                    <p className="text-[10px] text-muted">
                      {formatDate(item.publishedAt)}
                    </p>
                  )}

                  {item.createdAt &&
                    !item.publishedAt && (
                      <p className="text-[10px] text-muted">
                        {formatDate(item.createdAt)}
                      </p>
                    )}

                  {item.answer && (
                    <p className="text-xs text-muted mt-1 line-clamp-2">
                      {item.answer}
                    </p>
                  )}

                  {item.content && (
                    <p className="text-xs text-muted mt-1 line-clamp-2">
                      {item.content}
                    </p>
                  )}

                  {item.testimonial && (
                    <p className="text-xs text-muted mt-1 line-clamp-2">
                      "{item.testimonial}"
                    </p>
                  )}

                </div>

                {/* DELETE */}

                {tab !== "testimonials" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(item._id)
                    }
                    disabled={
                      deletingId === item._id
                    }
                    className="text-muted hover:text-red transition text-sm shrink-0 disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === item._id
                      ? "..."
                      : "×"}
                  </button>
                )}

              </div>

            </div>

          ))}

        </div>

      )}

      {/* ===================================================
          CREATE MODAL
          =================================================== */}

      <Modal
        isOpen={showCreate}
        onClose={handleCloseCreate}
        title={`Create ${
          tab === "blog"
            ? "Blog Post"
            : tab === "faqs"
            ? "FAQ"
            : "Testimonial"
        }`}
      >

        <div className="space-y-3">

          {/* BLOG */}

          {tab === "blog" && (
            <>
              <Input
                label="Title *"
                value={form.title}
                onChange={(e) =>
                  handleFormChange(
                    "title",
                    e.target.value
                  )
                }
                placeholder="Post title"
                required
              />

              <Textarea
                label="Content *"
                value={form.content}
                onChange={(e) =>
                  handleFormChange(
                    "content",
                    e.target.value
                  )
                }
                placeholder="Post content..."
                rows={6}
                required
              />
            </>
          )}

          {/* FAQ */}

          {tab === "faqs" && (
            <>
              <Input
                label="Question *"
                value={form.question}
                onChange={(e) =>
                  handleFormChange(
                    "question",
                    e.target.value
                  )
                }
                placeholder="FAQ question"
                required
              />

              <Textarea
                label="Answer *"
                value={form.answer}
                onChange={(e) =>
                  handleFormChange(
                    "answer",
                    e.target.value
                  )
                }
                placeholder="FAQ answer..."
                rows={4}
                required
              />
            </>
          )}

          {/* TESTIMONIAL */}

          {tab === "testimonials" && (
            <>
              <Input
                label="Student Name *"
                value={form.title}
                onChange={(e) =>
                  handleFormChange(
                    "title",
                    e.target.value
                  )
                }
                placeholder="Student name"
                required
              />

              <Textarea
                label="Testimonial *"
                value={form.content}
                onChange={(e) =>
                  handleFormChange(
                    "content",
                    e.target.value
                  )
                }
                placeholder="Student testimonial..."
                rows={5}
                required
              />
            </>
          )}

          {/* BUTTONS */}

          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={handleCloseCreate}
              disabled={creating}
              className="flex-1 bg-surfaceHigh border border-border text-text text-sm py-2.5 rounded-xl hover:border-purple/40 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="flex-1 bg-purple hover:bg-purple/90 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {creating
                ? "Creating..."
                : "Create"}
            </button>

          </div>

        </div>

      </Modal>

    </div>
  );
}
