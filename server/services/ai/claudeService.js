import claude from "../../config/claude.js";
import AIUsageLog from "../../models/system/AIUsageLog.js";

const callClaude = async ({
  userId,
  feature,
  prompt,
  systemPrompt = null,
  maxTokens = 1000,
}) => {
  const startTime = Date.now();

  try {
    const messages = [{ role: "user", content: prompt }];

    const response = await claude.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      ...(systemPrompt && {
        system: systemPrompt,
      }),
      messages,
    });

    const duration = Date.now() - startTime;
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const totalTokens = inputTokens + outputTokens;
    const estimatedCost = totalTokens * 0.000003;
    const content = response.content[0].text;

    // ── Log usage ───────────────────────────────────────
    await AIUsageLog.create({
      user: userId,
      feature,
      prompt,
      response: content,
      model: "claude-sonnet-4-6",
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
      duration,
      isSuccess: true,
    });

    return content;
  } catch (error) {
    const duration = Date.now() - startTime;

    // ── Log failed usage ────────────────────────────────
    await AIUsageLog.create({
      user: userId,
      feature,
      prompt,
      model: "claude-sonnet-4-6",
      duration,
      isSuccess: false,
      errorMessage: error.message,
    });

    console.error(`❌ Claude API error: ${error.message}`);
    throw error;
  }
};

// ── Generate quiz questions ───────────────────────────────
export const generateQuizQuestions = async ({
  userId,
  topic,
  difficulty,
  questionCount,
  questionTypes,
}) => {
  const prompt = `Generate ${questionCount} quiz questions about "${topic}" 
  with difficulty level: ${difficulty}.
  Question types: ${questionTypes.join(", ")}.
  
  Return ONLY valid JSON in this exact format:
  {
    "questions": [
      {
        "question": "Question text here",
        "type": "multiple_choice",
        "options": [
          {"text": "Option A", "isCorrect": false},
          {"text": "Option B", "isCorrect": true},
          {"text": "Option C", "isCorrect": false},
          {"text": "Option D", "isCorrect": false}
        ],
        "explanation": "Why the correct answer is correct",
        "points": 1,
        "difficulty": "${difficulty}"
      }
    ]
  }`;

  const response = await callClaude({
    userId,
    feature: "quiz-generation",
    prompt,
    maxTokens: 2000,
  });

  return JSON.parse(response);
};

// ── Generate assignment ───────────────────────────────────
export const generateAssignment = async ({
  userId,
  topic,
  courseLevel,
  durationDays,
}) => {
  const prompt = `Create a practical assignment for a ${courseLevel} level 
  course about "${topic}". Duration: ${durationDays} days.
  
  Return ONLY valid JSON:
  {
    "title": "Assignment title",
    "description": "Assignment description",
    "instructions": "Step by step instructions",
    "rubric": [
      {"criterion": "Criterion name", "description": "What is evaluated", "points": 20}
    ],
    "totalPoints": 100,
    "learningOutcomes": ["outcome 1", "outcome 2"]
  }`;

  const response = await callClaude({
    userId,
    feature: "assignment-generation",
    prompt,
    maxTokens: 1500,
  });

  return JSON.parse(response);
};

// ── Generate lesson outline ───────────────────────────────
export const generateLessonOutline = async ({
  userId,
  courseTopic,
  lessonTopic,
  duration,
}) => {
  const prompt = `Create a detailed lesson outline for a course about 
  "${courseTopic}". Lesson topic: "${lessonTopic}". Duration: ${duration} minutes.
  
  Return ONLY valid JSON:
  {
    "title": "Lesson title",
    "description": "Brief description",
    "learningOutcomes": ["outcome 1", "outcome 2"],
    "outline": [
      {"section": "Introduction", "duration": 5, "content": "What to cover"},
      {"section": "Main content", "duration": 20, "content": "What to cover"}
    ],
    "resources": ["resource 1", "resource 2"],
    "assessment": "How to assess understanding"
  }`;

  const response = await callClaude({
    userId,
    feature: "lesson-outline",
    prompt,
    maxTokens: 1500,
  });

  return JSON.parse(response);
};

// ── Explain concept ───────────────────────────────────────
export const explainConcept = async ({
  userId,
  concept,
  studentLevel,
}) => {
  const prompt = `Explain "${concept}" for a ${studentLevel} level student
  in a clear, practical, and engaging way.
  Use real-world examples and analogies.
  Keep it concise but complete.`;

  return await callClaude({
    userId,
    feature: "concept-explanation",
    prompt,
    maxTokens: 1000,
  });
};

// ── AI chatbot ────────────────────────────────────────────
export const chatbotResponse = async ({
  userId,
  message,
  context = null,
}) => {
  const systemPrompt = `You are a helpful AI assistant for Devad Tech Academy,
  a Nigerian tech school. You help students with:
  - Course questions and explanations
  - Technical programming problems
  - Career advice for Nigerian developers
  - Platform navigation
  
  Be friendly, concise, and practical.
  ${context ? `Context: ${context}` : ""}`;

  return await callClaude({
    userId,
    feature: "chatbot",
    prompt: message,
    systemPrompt,
    maxTokens: 800,
  });
};

// ── Analyze student performance ───────────────────────────
export const analyzeStudentPerformance = async ({
  userId,
  studentData,
}) => {
  const prompt = `Analyze this student's performance data and provide 
  personalized recommendations:
  ${JSON.stringify(studentData)}
  
  Return ONLY valid JSON:
  {
    "overallAssessment": "Brief assessment",
    "strengths": ["strength 1", "strength 2"],
    "areasForImprovement": ["area 1", "area 2"],
    "recommendations": ["recommendation 1", "recommendation 2"],
    "nextSteps": ["step 1", "step 2"]
  }`;

  const response = await callClaude({
    userId,
    feature: "student-analysis",
    prompt,
    maxTokens: 1000,
  });

  return JSON.parse(response);
};

export default callClaude;