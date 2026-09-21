import { BrevoClient } from "@getbrevo/brevo";
import env from "../../config/env.js";

const brevo = new BrevoClient({
  apiKey: env.BREVO_API_KEY,
});

const sendEmail = async ({
  to,
  subject,
  htmlContent,
  textContent = null,
  attachments = [],
}) => {
  try {
    const emailData = {
      sender: {
        name: env.BREVO_FROM_NAME,
        email: env.BREVO_FROM_EMAIL,
      },

      to: Array.isArray(to)
        ? to.map((email) => ({ email }))
        : [{ email: to }],

      subject,
      htmlContent,

      ...(textContent && {
        textContent,
      }),

      ...(attachments.length > 0 && {
        attachment: attachments,
      }),
    };

    const response =
      await brevo.transactionalEmails.sendTransacEmail(emailData);

    console.log(`✅ Email sent to ${to}: ${response.messageId}`);

    return response;
  } catch (error) {
    console.error(
      `❌ Email send error:`,
      error?.body || error?.message || error
    );

    throw error;
  }
};

export default sendEmail;
