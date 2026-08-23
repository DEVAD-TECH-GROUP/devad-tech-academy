import brevoClient from "../../config/brevo.js";
import * as Brevo from "@getbrevo/brevo";
import env from "../../config/env.js";

const sendEmail = async ({
  to,
  subject,
  htmlContent,
  textContent = null,
  attachments = [],
}) => {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: env.BREVO_FROM_NAME,
      email: env.BREVO_FROM_EMAIL,
    };
    sendSmtpEmail.to = Array.isArray(to)
      ? to.map((email) => ({ email }))
      : [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    if (textContent) {
      sendSmtpEmail.textContent = textContent;
    }

    if (attachments.length > 0) {
      sendSmtpEmail.attachment = attachments;
    }

    const response = await brevoClient.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent to ${to}: ${response.messageId}`);
    return response;
  } catch (error) {
    console.error(`❌ Email send error: ${error.message}`);
    throw error;
  }
};

export default sendEmail;