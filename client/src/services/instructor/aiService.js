import api from "../../api/Api";

export const generateQuiz = (payload) =>
  api.post("/instructor/ai/generate-quiz", payload);

export const generateAssignment = (payload) =>
  api.post("/instructor/ai/generate-assignment", payload);

export const generateOutline = (payload) =>
  api.post("/instructor/ai/generate-outline", payload);

export const explainConcept = (payload) =>
  api.post("/instructor/ai/explain-concept", payload);

export const analyzePerformance = (payload) =>
  api.post("/instructor/ai/analyze-performance", payload);