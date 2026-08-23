import axios from "axios";
import env from "./env.js";

const termiiClient = {
  baseURL: "https://api.ng.termii.com/api",

  // ── Send SMS ──────────────────────────────────────────
  sendSMS: async (to, message) => {
    try {
      const response = await axios.post(
        `${termiiClient.baseURL}/sms/send`,
        {
          to,
          from: env.TERMII_SENDER_ID,
          sms: message,
          type: "plain",
          api_key: env.TERMII_API_KEY,
          channel: "generic",
        }
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Termii SMS error: ${error.message}`);
      throw error;
    }
  },

  // ── Send OTP ──────────────────────────────────────────
  sendOTP: async (to) => {
    try {
      const response = await axios.post(
        `${termiiClient.baseURL}/sms/otp/send`,
        {
          api_key: env.TERMII_API_KEY,
          message_type: "NUMERIC",
          to,
          from: env.TERMII_SENDER_ID,
          channel: "generic",
          pin_attempts: 3,
          pin_time_to_live: 10,
          pin_length: 6,
          pin_placeholder: "< 1234 >",
          message_text: "Your Devad Academy OTP is < 1234 >. Valid for 10 minutes.",
          pin_type: "NUMERIC",
        }
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Termii OTP error: ${error.message}`);
      throw error;
    }
  },

  // ── Verify OTP ─────────────────────────────────────────
  verifyOTP: async (pinId, pin) => {
    try {
      const response = await axios.post(
        `${termiiClient.baseURL}/sms/otp/verify`,
        {
          api_key: env.TERMII_API_KEY,
          pin_id: pinId,
          pin,
        }
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Termii verify OTP error: ${error.message}`);
      throw error;
    }
  },
};

export default termiiClient;