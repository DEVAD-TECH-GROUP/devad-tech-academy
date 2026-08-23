import * as Brevo from "@getbrevo/brevo";
import env from "./env.js";

const brevoClient = new Brevo.TransactionalEmailsApi();

brevoClient.authentications["api-key"].apiKey = env.BREVO_API_KEY;

export default brevoClient;