import { useEffect, useState } from "react";
import {
  createAnnouncement,
  sendEmailCampaign,
  sendSMSBlast,
  sendPushNotification,
} from "../../services/superadmin/communicationService";
import Tabs from "../../components/common/Tabs";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import { toast } from "react-hot-toast";

// ============================================================
// DEVAD COMMUNICATION DEBUG LOGGER
// ============================================================

const DEBUG = true;

const log = (...args) => {
  if (!DEBUG) return;

  console.log(
    "%c[DEVAD COMMUNICATION]",
    "color:#8b5cf6;font-weight:bold;",
    ...args
  );
};

const logInfo = (...args) => {
  if (!DEBUG) return;

  console.log(
    "%c[DEVAD COMMUNICATION INFO]",
    "color:#3b82f6;font-weight:bold;",
    ...args
  );
};

const logSuccess = (...args) => {
  if (!DEBUG) return;

  console.log(
    "%c[DEVAD COMMUNICATION SUCCESS]",
    "color:#22c55e;font-weight:bold;",
    ...args
  );
};

const logWarn = (...args) => {
  if (!DEBUG) return;

  console.warn(
    "%c[DEVAD COMMUNICATION WARNING]",
    "color:#f59e0b;font-weight:bold;",
    ...args
  );
};

const logError = (...args) => {
  if (!DEBUG) return;

  console.error(
    "%c[DEVAD COMMUNICATION ERROR]",
    "color:#ef4444;font-weight:bold;",
    ...args
  );
};

// ============================================================
// COMPONENT
// ============================================================

export default function Communication() {
  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [tab, setTab] = useState("announce");

  const [form, setForm] = useState({
    title: "",
    message: "",
    targetAudience: "all",
  });

  const [sending, setSending] = useState(false);

  // ----------------------------------------------------------
  // INITIAL LOG
  // ----------------------------------------------------------

  useEffect(() => {
    log("Communication component mounted.");

    logInfo("Initial tab:", "announce");

    logInfo("Initial form:", {
      title: "",
      message: "",
      targetAudience: "all",
    });

    return () => {
      log("Communication component unmounted.");
    };
  }, []);

  // ----------------------------------------------------------
  // TAB CHANGE LOG
  // ----------------------------------------------------------

  useEffect(() => {
    log("Active communication tab changed:", tab);

    logInfo("Current form when tab changed:", form);

    switch (tab) {
      case "announce":
        logInfo("Communication mode: Announcement");
        break;

      case "email":
        logInfo("Communication mode: Email Campaign");
        break;

      case "sms":
        logInfo("Communication mode: SMS Blast");
        break;

      case "push":
        logInfo("Communication mode: Push Notification");
        break;

      default:
        logWarn("Unknown communication tab:", tab);
    }
  }, [tab]);

  // ----------------------------------------------------------
  // FORM STATE LOG
  // ----------------------------------------------------------

  useEffect(() => {
    logInfo("Form state updated:", {
      titleLength: form.title.length,
      messageLength: form.message.length,
      targetAudience: form.targetAudience,
    });
  }, [form]);

  // ----------------------------------------------------------
  // SENDING STATE LOG
  // ----------------------------------------------------------

  useEffect(() => {
    logInfo("Sending state changed:", sending);
  }, [sending]);

  // ----------------------------------------------------------
  // SET FORM FIELD
  // ----------------------------------------------------------

  const set = (key, value) => {
    log("Form field changed.");

    logInfo("Field:", key);

    // Don't dump potentially large message content repeatedly.
    if (key === "message") {
      logInfo("Message length:", value.length);
    } else {
      logInfo("Value:", value);
    }

    setForm((previousForm) => {
      const updatedForm = {
        ...previousForm,
        [key]: value,
      };

      logInfo("Updated form:", {
        title: updatedForm.title,
        messageLength: updatedForm.message.length,
        targetAudience: updatedForm.targetAudience,
      });

      return updatedForm;
    });
  };

  // ----------------------------------------------------------
  // BUILD PAYLOAD
  // ----------------------------------------------------------

  const getPayload = () => {
    let payload;

    switch (tab) {
      case "announce":
        payload = {
          ...form,
          sendPushNotification: true,
          sendEmail: true,
        };
        break;

      case "email":
        payload = {
          subject: form.title,
          message: form.message,
          targetAudience: form.targetAudience,
        };
        break;

      case "sms":
        payload = {
          message: form.message,
          targetAudience: form.targetAudience,
        };
        break;

      case "push":
        payload = {
          title: form.title,
          message: form.message,
        };
        break;

      default:
        payload = null;
    }

    logInfo("Generated API payload for tab:", tab);

    if (payload) {
      logInfo("Payload:", {
        ...payload,

        // Avoid excessively logging the complete message.
        message:
          typeof payload.message === "string"
            ? `[${payload.message.length} characters]`
            : payload.message,
      });
    }

    return payload;
  };

  // ----------------------------------------------------------
  // API HANDLERS
  // ----------------------------------------------------------

  const handlers = {
    announce: async () => {
      const payload = getPayload();

      log("Calling createAnnouncement()...");
      logInfo("Announcement payload:", payload);

      const response = await createAnnouncement(payload);

      logSuccess("createAnnouncement() completed.");
      logInfo("Announcement response:", response);

      return response;
    },

    email: async () => {
      const payload = getPayload();

      log("Calling sendEmailCampaign()...");
      logInfo("Email campaign payload:", payload);

      const response = await sendEmailCampaign(payload);

      logSuccess("sendEmailCampaign() completed.");
      logInfo("Email campaign response:", response);

      return response;
    },

    sms: async () => {
      const payload = getPayload();

      log("Calling sendSMSBlast()...");
      logInfo("SMS blast payload:", payload);

      const response = await sendSMSBlast(payload);

      logSuccess("sendSMSBlast() completed.");
      logInfo("SMS blast response:", response);

      return response;
    },

    push: async () => {
      const payload = getPayload();

      log("Calling sendPushNotification()...");
      logInfo("Push notification payload:", payload);

      const response = await sendPushNotification(payload);

      logSuccess("sendPushNotification() completed.");
      logInfo("Push notification response:", response);

      return response;
    },
  };

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  const validateForm = () => {
    log("Validating communication form...");

    const title = form.title.trim();
    const message = form.message.trim();

    logInfo("Validation data:", {
      tab,
      titleLength: title.length,
      messageLength: message.length,
      targetAudience: form.targetAudience,
    });

    if (!title) {
      logWarn("Validation failed: title/subject is empty.");

      toast.error("Please enter a title or subject.");

      return false;
    }

    if (!message) {
      logWarn("Validation failed: message is empty.");

      toast.error("Please enter a message.");

      return false;
    }

    if (!handlers[tab]) {
      logError("Validation failed: no handler exists for tab:", tab);

      toast.error("Invalid communication type.");

      return false;
    }

    logSuccess("Form validation passed.");

    return true;
  };

  // ----------------------------------------------------------
  // SEND
  // ----------------------------------------------------------

  const handleSend = async () => {
    log("============================================================");
    log("SEND BUTTON CLICKED");
    log("============================================================");

    logInfo("Current tab:", tab);

    logInfo("Current form:", {
      title: form.title,
      messageLength: form.message.length,
      targetAudience: form.targetAudience,
    });

    // Prevent duplicate submissions.
    if (sending) {
      logWarn("Send ignored because another request is already running.");

      return;
    }

    // Validate.
    if (!validateForm()) {
      logWarn("Send stopped because validation failed.");

      return;
    }

    setSending(true);

    logInfo("Sending state set to TRUE.");

    const requestStartedAt = Date.now();

    try {
      log("Starting communication request...");

      logInfo("Request type:", tab);

      const response = await handlers[tab]();

      const duration = Date.now() - requestStartedAt;

      logSuccess("============================================================");
      logSuccess("COMMUNICATION REQUEST SUCCESSFUL");
      logSuccess("============================================================");

      logSuccess("Type:", tab);
      logSuccess("Duration:", `${duration}ms`);
      logSuccess("Response:", response);

      if (response?.data) {
        logInfo("Response data:", response.data);
      }

      if (response?.status) {
        logInfo("HTTP status:", response.status);
      }

      toast.success("Sent successfully! 📢");

      logSuccess("Success toast displayed.");

      // Reset form.
      const resetForm = {
        title: "",
        message: "",
        targetAudience: "all",
      };

      setForm(resetForm);

      logInfo("Communication form reset.");
    } catch (error) {
      const duration = Date.now() - requestStartedAt;

      logError("============================================================");
      logError("COMMUNICATION REQUEST FAILED");
      logError("============================================================");

      logError("Type:", tab);
      logError("Duration:", `${duration}ms`);

      // Axios error information.
      logError("Error object:", error);

      logError("Error name:", error?.name);

      logError("Error message:", error?.message);

      logError("Error code:", error?.code);

      logError("Error status:", error?.status);

      // Axios response.
      if (error?.response) {
        logError("HTTP response exists.");

        logError("Response status:", error.response.status);

        logError("Response status text:", error.response.statusText);

        logError("Response data:", error.response.data);

        logError("Response headers:", error.response.headers);
      } else {
        logWarn("No HTTP response object found.");
      }

      // Axios request.
      if (error?.request) {
        logError("Axios request object exists:", error.request);
      } else {
        logWarn("No Axios request object found.");
      }

      // Stack trace.
      if (error?.stack) {
        logError("Stack trace:", error.stack);
      }

      // Server message.
      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to send";

      logError("Final displayed error message:", serverMessage);

      toast.error(serverMessage);
    } finally {
      setSending(false);

      logInfo("Sending state set to FALSE.");

      log("============================================================");
      log("SEND PROCESS FINISHED");
      log("============================================================");
    }
  };

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  log("Rendering Communication page.");

  return (
    <div className="space-y-5 fi max-w-2xl">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="dsp text-xl font-bold text-text">
            Communication
          </h1>

          <p className="text-xs text-muted mt-1">
            Send announcements and notifications to users.
          </p>
        </div>
      </div>

      {/* ====================================================== */}
      {/* TABS */}
      {/* ====================================================== */}

      <Tabs
        tabs={[
          {
            key: "announce",
            label: "Announce",
            icon: "📢",
          },
          {
            key: "email",
            label: "Email",
            icon: "✉️",
          },
          {
            key: "sms",
            label: "SMS",
            icon: "📱",
          },
          {
            key: "push",
            label: "Push",
            icon: "🔔",
          },
        ]}
        active={tab}
        onChange={(newTab) => {
          log("Tab selection requested.");

          logInfo("Previous tab:", tab);
          logInfo("New tab:", newTab);

          setTab(newTab);

          logSuccess("Tab changed to:", newTab);
        }}
      />

      {/* ====================================================== */}
      {/* FORM */}
      {/* ====================================================== */}

      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        {/* ---------------------------------------------------- */}
        {/* TITLE / SUBJECT */}
        {/* ---------------------------------------------------- */}

        <Input
          label="Title / Subject *"
          value={form.title}
          onChange={(e) => {
            log("Title/subject input changed.");

            set("title", e.target.value);
          }}
          placeholder="Message title"
          required
        />

        {/* ---------------------------------------------------- */}
        {/* MESSAGE */}
        {/* ---------------------------------------------------- */}

        <Textarea
          label="Message *"
          value={form.message}
          onChange={(e) => {
            log("Message input changed.");

            set("message", e.target.value);
          }}
          placeholder="Your message..."
          rows={5}
          required
        />

        {/* ---------------------------------------------------- */}
        {/* TARGET AUDIENCE */}
        {/* ---------------------------------------------------- */}

        {["announce", "email", "sms"].includes(tab) && (
          <Select
            label="Target Audience"
            value={form.targetAudience}
            onChange={(e) => {
              log("Target audience changed.");

              logInfo("Previous audience:", form.targetAudience);
              logInfo("New audience:", e.target.value);

              set("targetAudience", e.target.value);
            }}
            options={[
              {
                value: "all",
                label: "All Users",
              },
              {
                value: "student",
                label: "Students Only",
              },
              {
                value: "instructor",
                label: "Instructors Only",
              },
            ]}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* SEND BUTTON */}
        {/* ---------------------------------------------------- */}

        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          className="w-full bg-purple hover:bg-purple/90 text-white font-semibold py-3 rounded-xl text-sm transition disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Now"}
        </button>
      </div>

      {/* ====================================================== */}
      {/* DEBUG INFORMATION */}
      {/* ====================================================== */}

      {DEBUG && (
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-text mb-2">
            Communication Debug
          </p>

          <div className="space-y-1 text-[11px] text-muted">
            <p>
              <span className="text-text">Mode:</span>{" "}
              {tab}
            </p>

            <p>
              <span className="text-text">Title:</span>{" "}
              {form.title.length} characters
            </p>

            <p>
              <span className="text-text">Message:</span>{" "}
              {form.message.length} characters
            </p>

            <p>
              <span className="text-text">Audience:</span>{" "}
              {form.targetAudience}
            </p>

            <p>
              <span className="text-text">Sending:</span>{" "}
              {sending ? "Yes" : "No"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
