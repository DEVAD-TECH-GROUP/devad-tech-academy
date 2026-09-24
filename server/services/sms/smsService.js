// services/sms/smsService.js

import {
  sendSMS as robaseSendSMS,
  sendOTP as robaseSendOTP,
  verifyOTP as robaseVerifyOTP,
} from "../../config/robase.js";

/* ============================================================
   SEND SMS
   ============================================================ */

export const sendSMS = async (phone, message) => {
  try {
    const response = await robaseSendSMS({
      to: phone,
      message,
    });

    if (!response?.success) {
      throw new Error(
        response?.error ||
          "Robase SMS failed"
      );
    }

    console.log(
      `✅ SMS sent to ${phone}`
    );

    return response;
  } catch (error) {
    console.error(
      `❌ Robase SMS send error: ${error.message}`
    );

    throw error;
  }
};


/* ============================================================
   SEND OTP
   ============================================================ */

/**
 * Sends a verification OTP through Robase.
 *
 * Used for:
 *
 * - Registration phone verification
 * - Phone number changes
 * - Other phone verification flows
 */
export const sendOTP = async (phone) => {
  try {
    if (!phone) {
      throw new Error(
        "Phone number is required"
      );
    }

    const response =
      await robaseSendOTP(phone);

    if (!response?.success) {
      throw new Error(
        response?.error ||
          "Robase OTP send failed"
      );
    }

    if (!response?.otpId) {
      throw new Error(
        "Robase did not return an OTP ID"
      );
    }

    console.log(
      `✅ OTP sent to ${phone}`
    );

    return response;
  } catch (error) {
    console.error(
      `❌ Robase OTP send error: ${error.message}`
    );

    throw error;
  }
};


/* ============================================================
   VERIFY OTP
   ============================================================ */

/**
 * Verifies an OTP through Robase.
 *
 * @param {string} otpId
 * @param {string|number} code
 */
export const verifyOTP = async (
  otpId,
  code
) => {
  try {
    if (!otpId) {
      throw new Error(
        "OTP ID is required"
      );
    }

    if (!code) {
      throw new Error(
        "OTP code is required"
      );
    }

    const response =
      await robaseVerifyOTP(
        otpId,
        code
      );

    if (!response?.success) {
      throw new Error(
        response?.error ||
          "OTP verification failed"
      );
    }

    console.log(
      `✅ OTP verified successfully`
    );

    return response;
  } catch (error) {
    console.error(
      `❌ Robase OTP verification error: ${error.message}`
    );

    throw error;
  }
};


/* ============================================================
   DEFAULT EXPORT
   ============================================================ */

export default {
  sendSMS,
  sendOTP,
  verifyOTP,
};
