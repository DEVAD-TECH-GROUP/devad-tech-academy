import termiiClient from "../../config/termii.js";

// ── Send SMS ──────────────────────────────────────────────
export const sendSMS = async (phone, message) => {
  try {
    const response = await termiiClient.sendSMS(phone, message);
    console.log(`✅ SMS sent to ${phone}`);
    return response;
  } catch (error) {
    console.error(`❌ SMS send error: ${error.message}`);
    throw error;
  }
};

// ── Send OTP ──────────────────────────────────────────────
export const sendOTP = async (phone) => {
  try {
    const response = await termiiClient.sendOTP(phone);
    console.log(`✅ OTP sent to ${phone}`);
    return response;
  } catch (error) {
    console.error(`❌ OTP send error: ${error.message}`);
    throw error;
  }
};

// ── Verify OTP ────────────────────────────────────────────
export const verifyOTP = async (pinId, pin) => {
  try {
    const response = await termiiClient.verifyOTP(pinId, pin);
    console.log(`✅ OTP verified`);
    return response;
  } catch (error) {
    console.error(`❌ OTP verify error: ${error.message}`);
    throw error;
  }
};