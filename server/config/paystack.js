import Paystack from "paystack-node";
import env from "./env.js";

const paystack = new Paystack(env.PAYSTACK_SECRET_KEY);

export default paystack;