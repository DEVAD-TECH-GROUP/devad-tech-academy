import { BrevoClient } from "@getbrevo/brevo";
import env from "./env.js";

const brevo = new BrevoClient({
  apiKey: env.BREVO_API_KEY,
});

// Compatibility wrapper
const brevoClient = {
  sendTransacEmail: (...args) => {
    return brevo.transactionalEmails.sendTransacEmail(...args);
  },
};

export default brevoClient



