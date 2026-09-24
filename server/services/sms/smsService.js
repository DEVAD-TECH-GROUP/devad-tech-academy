import {
  sendSMS as robaseSendSMS,
} from "../../config/robase.js";

// ── Send SMS ──────────────────────────────────────────────
export const sendSMS = async (phone, message) => {
  try {
    const response = await robaseSendSMS({
      to: phone,
      message,
    });

    if (!response.success) {
      throw new Error(response.error || "Robase SMS failed");
    }

    console.log(`✅ SMS sent to ${phone}`);

    return response;
  } catch (error) {
    console.error(
      `❌ Robase SMS send error: ${error.message}`
    );

    throw error;
  }
};
