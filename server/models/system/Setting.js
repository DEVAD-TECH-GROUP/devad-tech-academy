import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    // ── General ───────────────────────────────────────
    general: {
      academyName: {
        type: String,
        default: "Devad Tech Academy",
      },
      academyEmail: {
        type: String,
        default: "support@devadtech.academy",
      },
      academyPhone: {
        type: String,
        default: null,
      },
      domain: {
        type: String,
        default: "devadtech.academy",
      },
      timezone: {
        type: String,
        default: "Africa/Lagos",
      },
      language: {
        type: String,
        default: "en",
      },
      currency: {
        type: String,
        default: "NGN",
      },
    },

    // ── Branding ──────────────────────────────────────
    branding: {
      logo: {
        public_id: { type: String, default: null },
        url: { type: String, default: null },
      },
      favicon: {
        public_id: { type: String, default: null },
        url: { type: String, default: null },
      },
      primaryColor: {
        type: String,
        default: "#818CF8",
      },
      secondaryColor: {
        type: String,
        default: "#34D399",
      },
    },

    // ── Maintenance ───────────────────────────────────
    maintenance: {
      isEnabled: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        default: "We are currently undergoing maintenance. Please check back soon.",
      },
      estimatedEnd: {
        type: Date,
        default: null,
      },
    },

    // ── Payments ──────────────────────────────────────
    payments: {
      activeGateway: {
        type: String,
        enum: ["paystack", "flutterwave"],
        default: "paystack",
      },
      monthlyPlanAmount: {
        type: Number,
        default: 12500,
      },
      annualPlanAmount: {
        type: Number,
        default: 100000,
      },
      platformFeePercent: {
        type: Number,
        default: 30,
      },
      vatPercent: {
        type: Number,
        default: 7.5,
      },
    },

    // ── Email ─────────────────────────────────────────
    email: {
      provider: {
        type: String,
        default: "brevo",
      },
      fromName: {
        type: String,
        default: "Devad Tech Academy",
      },
      fromEmail: {
        type: String,
        default: "support@devadtech.academy",
      },
    },

    // ── Security ──────────────────────────────────────
    security: {
      maxLoginAttempts: {
        type: Number,
        default: 5,
      },
      lockoutDuration: {
        type: Number,
        default: 30, // minutes
      },
      sessionTimeout: {
        type: Number,
        default: 30, // minutes
      },
      force2FAForAdmins: {
        type: Boolean,
        default: false,
      },
    },

    // ── AI ────────────────────────────────────────────
    ai: {
      isChatbotEnabled: {
        type: Boolean,
        default: true,
      },
      isTutorEnabled: {
        type: Boolean,
        default: true,
      },
      model: {
        type: String,
        default: "claude-sonnet-4-6",
      },
      maxTokensPerRequest: {
        type: Number,
        default: 1000,
      },
    },

    // ── Notifications ─────────────────────────────────
    notifications: {
      isPushEnabled: {
        type: Boolean,
        default: true,
      },
      isEmailEnabled: {
        type: Boolean,
        default: true,
      },
      isSMSEnabled: {
        type: Boolean,
        default: false,
      },
    },

    // ── Last updated by ───────────────────────────────
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model("Setting", settingSchema);

export default Setting;