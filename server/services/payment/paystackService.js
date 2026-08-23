import axios from "axios";
import env from "../../config/env.js";
import { nairaToKobo } from "../../utils/formatCurrency.js";

const paystackAPI = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// ── Initialize payment ────────────────────────────────────
export const initializePayment = async ({
  email,
  amount,
  reference,
  metadata = {},
  callbackUrl = null,
}) => {
  try {
    const response = await paystackAPI.post("/transaction/initialize", {
      email,
      amount: nairaToKobo(amount),
      reference,
      metadata,
      callback_url: callbackUrl,
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Paystack initialize error: ${error.message}`);
    throw error;
  }
};

// ── Verify payment ────────────────────────────────────────
export const verifyPayment = async (reference) => {
  try {
    const response = await paystackAPI.get(
      `/transaction/verify/${reference}`
    );
    return response.data;
  } catch (error) {
    console.error(`❌ Paystack verify error: ${error.message}`);
    throw error;
  }
};

// ── Create subscription plan ──────────────────────────────
export const createPlan = async ({
  name,
  interval,
  amount,
}) => {
  try {
    const response = await paystackAPI.post("/plan", {
      name,
      interval,
      amount: nairaToKobo(amount),
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Paystack create plan error: ${error.message}`);
    throw error;
  }
};

// ── Create subscription ───────────────────────────────────
export const createSubscription = async ({
  customer,
  plan,
  authorization,
}) => {
  try {
    const response = await paystackAPI.post("/subscription", {
      customer,
      plan,
      authorization,
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Paystack subscription error: ${error.message}`);
    throw error;
  }
};

// ── Cancel subscription ───────────────────────────────────
export const cancelSubscription = async ({
  code,
  token,
}) => {
  try {
    const response = await paystackAPI.post(
      "/subscription/disable",
      { code, token }
    );
    return response.data;
  } catch (error) {
    console.error(`❌ Paystack cancel subscription error: ${error.message}`);
    throw error;
  }
};

// ── Refund payment ────────────────────────────────────────
export const refundPayment = async ({
  transaction,
  amount = null,
}) => {
  try {
    const response = await paystackAPI.post("/refund", {
      transaction,
      ...(amount && { amount: nairaToKobo(amount) }),
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Paystack refund error: ${error.message}`);
    throw error;
  }
};

// ── Create transfer recipient ─────────────────────────────
export const createTransferRecipient = async ({
  name,
  accountNumber,
  bankCode,
}) => {
  try {
    const response = await paystackAPI.post("/transferrecipient", {
      type: "nuban",
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Paystack recipient error: ${error.message}`);
    throw error;
  }
};

// ── Initiate transfer (payout) ────────────────────────────
export const initiateTransfer = async ({
  amount,
  recipient,
  reason,
  reference,
}) => {
  try {
    const response = await paystackAPI.post("/transfer", {
      source: "balance",
      amount: nairaToKobo(amount),
      recipient,
      reason,
      reference,
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Paystack transfer error: ${error.message}`);
    throw error;
  }
};

// ── Verify bank account ───────────────────────────────────
export const verifyBankAccount = async ({
  accountNumber,
  bankCode,
}) => {
  try {
    const response = await paystackAPI.get(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
    );
    return response.data;
  } catch (error) {
    console.error(`❌ Paystack bank verify error: ${error.message}`);
    throw error;
  }
};

// ── Get list of banks ─────────────────────────────────────
export const getBanks = async () => {
  try {
    const response = await paystackAPI.get("/bank?country=nigeria");
    return response.data;
  } catch (error) {
    console.error(`❌ Paystack get banks error: ${error.message}`);
    throw error;
  }
};

// ── Webhook verification ──────────────────────────────────
export const verifyWebhook = (signature, payload) => {
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest("hex");
  return hash === signature;
};