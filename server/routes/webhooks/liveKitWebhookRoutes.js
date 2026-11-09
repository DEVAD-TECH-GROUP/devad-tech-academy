import express from "express";
import {
  receiveLiveKitWebhook,
} from "../../controllers/webhooks/liveKitWebhookController.js";

const router = express.Router();

router.post(
  "/",
  express.raw({
    type: "application/webhook+json",
    limit: "2mb",
  }),
  receiveLiveKitWebhook
);

export default router;
