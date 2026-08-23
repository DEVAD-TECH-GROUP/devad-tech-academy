import Anthropic from "@anthropic-ai/sdk";
import env from "./env.js";

const claude = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

export default claude;