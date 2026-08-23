import mongoose from "mongoose";
import {
  TICKET_STATUS,
  TICKET_PRIORITY,
} from "../../utils/constants.js";

const supportTicketSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Ticket info ───────────────────────────────────
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    category: {
      type: String,
      enum: [
        "general",
        "technical",
        "payment",
        "course",
        "certificate",
        "account",
        "other",
      ],
      default: "general",
    },

    // ── Priority ──────────────────────────────────────
    priority: {
      type: String,
      enum: Object.values(TICKET_PRIORITY),
      default: TICKET_PRIORITY.MEDIUM,
    },

    // ── Status ────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.OPEN,
    },

    // ── Attachments ───────────────────────────────────
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        public_id: { type: String },
        type: { type: String },
      },
    ],

    // ── Replies ───────────────────────────────────────
    replies: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
          maxlength: [3000, "Reply cannot exceed 3000 characters"],
        },
        attachments: [
          {
            name: { type: String },
            url: { type: String },
            public_id: { type: String },
            type: { type: String },
          },
        ],
        isStaffReply: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ── Resolution ────────────────────────────────────
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolutionNote: {
      type: String,
      default: null,
    },

    // ── Rating ────────────────────────────────────────
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    satisfactionFeedback: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Index ─────────────────────────────────────────────────
supportTicketSchema.index({ ticketId: 1 });
supportTicketSchema.index({ user: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ priority: 1 });
supportTicketSchema.index({ assignedTo: 1 });
supportTicketSchema.index({ createdAt: -1 });

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;