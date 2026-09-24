// config/robase.js

import axios from "axios";

const ROBASE_BASE_URL =
  process.env.ROBASE_BASE_URL || "https://api.robase.dev";

/* ============================================================
   NORMALIZE PHONE
   ============================================================ */

/**
 * Normalize a phone number to E.164 format.
 *
 * Examples:
 *
 * 08012345678     → +2348012345678
 * +2348012345678  → +2348012345678
 * 2348012345678   → +2348012345678
 */
export const normalizePhone = (rawPhone) => {
  if (!rawPhone) return "";

  let phone = String(rawPhone)
    .trim()
    .replace(/[\s-]/g, "");

  // Remove leading +
  if (phone.startsWith("+")) {
    phone = phone.slice(1);
  }

  // Nigerian local format
  if (phone.startsWith("0")) {
    phone = "234" + phone.slice(1);
  }

  // Nigerian international format
  if (phone.startsWith("234")) {
    return "+" + phone;
  }

  // Fallback
  return "+" + phone;
};

/* ============================================================
   SEND SMS
   ============================================================ */

/**
 * Send an SMS through Robase.
 *
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.message
 */
export const sendSMS = async ({ to, message }) => {
  if (!to) {
    return {
      success: false,
      error: "No recipient phone number provided",
    };
  }

  if (!message) {
    return {
      success: false,
      error: "No SMS message provided",
    };
  }

  if (!process.env.ROBASE_API_KEY) {
    console.warn(
      "⚠️ ROBASE_API_KEY not set — skipping SMS send"
    );

    return {
      success: false,
      error: "ROBASE_API_KEY not configured",
    };
  }

  const recipient = normalizePhone(to);

  if (!recipient) {
    return {
      success: false,
      error: "Invalid recipient phone number",
    };
  }

  try {
    const response = await axios.post(
      `${ROBASE_BASE_URL}/v1/sms/send`,
      {
        phone_number: recipient,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ROBASE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const data = response.data;

    if (data?.id) {
      console.log(
        `✅ Robase SMS sent to ${recipient} (${data.id})`
      );

      return {
        success: true,
        messageId: data.id,
      };
    }

    return {
      success: false,
      error: JSON.stringify(data),
    };
  } catch (error) {
    const errMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data ||
      error.message ||
      "Unknown SMS error";

    console.error(
      "❌ Robase SMS send failed:",
      errMsg
    );

    return {
      success: false,
      error:
        typeof errMsg === "string"
          ? errMsg
          : JSON.stringify(errMsg),
    };
  }
};

/* ============================================================
   SEND OTP
   ============================================================ */

/**
 * Send OTP through Robase.
 *
 * @param {string} phone
 */
export const sendOTP = async (phone) => {
  if (!phone) {
    return {
      success: false,
      error: "No phone number provided",
    };
  }

  if (!process.env.ROBASE_API_KEY) {
    console.warn(
      "⚠️ ROBASE_API_KEY not set — skipping OTP send"
    );

    return {
      success: false,
      error: "ROBASE_API_KEY not configured",
    };
  }

  const recipient = normalizePhone(phone);

  if (!recipient) {
    return {
      success: false,
      error: "Invalid phone number",
    };
  }

  try {
    const response = await axios.post(
      `${ROBASE_BASE_URL}/v1/otp/send`,
      {
        phone_number: recipient,
        code_length: 6,
        ttl_seconds: 600,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ROBASE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const data = response.data;

    if (data?.id) {
      console.log(
        `✅ Robase OTP sent to ${recipient} (${data.id})`
      );

      return {
        success: true,
        otpId: data.id,
      };
    }

    return {
      success: false,
      error: JSON.stringify(data),
    };
  } catch (error) {
    const errMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data ||
      error.message ||
      "Unknown OTP error";

    console.error(
      "❌ Robase OTP send failed:",
      errMsg
    );

    return {
      success: false,
      error:
        typeof errMsg === "string"
          ? errMsg
          : JSON.stringify(errMsg),
    };
  }
};

/* ============================================================
   VERIFY OTP
   ============================================================ */

/**
 * Verify an OTP through Robase.
 *
 * @param {string} otpId
 * @param {string} code
 */
export const verifyOTP = async (otpId, code) => {
  if (!otpId) {
    return {
      success: false,
      error: "OTP ID is required",
    };
  }

  if (!code) {
    return {
      success: false,
      error: "OTP code is required",
    };
  }

  if (!process.env.ROBASE_API_KEY) {
    return {
      success: false,
      error: "ROBASE_API_KEY not configured",
    };
  }

  try {
    const response = await axios.post(
      `${ROBASE_BASE_URL}/v1/otp/verify`,
      {
        otp_id: otpId,
        code: String(code).trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ROBASE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const data = response.data;

    console.log(
      `✅ Robase OTP verification successful`
    );

    return {
      success: true,
      data,
    };
  } catch (error) {
    const errMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data ||
      error.message ||
      "Invalid or expired OTP";

    console.error(
      "❌ Robase OTP verification failed:",
      errMsg
    );

    return {
      success: false,
      error:
        typeof errMsg === "string"
          ? errMsg
          : JSON.stringify(errMsg),
    };
  }
};

/* ============================================================
   DEFAULT EXPORT
   ============================================================ */

export default {
  normalizePhone,
  sendSMS,
  sendOTP,
  verifyOTP,
};
