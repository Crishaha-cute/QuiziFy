import { GoogleGenAI, Type } from "@google/genai";

/**
 * Lazily initializes the GoogleGenAI client.
 * This function is called only when an API call is needed. It sources the
 * API key from the `process.env.API_KEY` environment variable.
 * @returns An instance of the GoogleGenAI client.
 * @throws An error if the API_KEY is not configured in the environment.
 */
const getAiClient = () => {
    // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
    // Assume this variable is pre-configured and accessible.
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        throw new Error("API Key is not configured.");
    }
    return new GoogleGenAI({ apiKey });
};

const QUIZ_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: 'The quiz question.'
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'An array of 4 multiple-choice options.'
      },
      correctAnswer: {
        type: Type.STRING,
        description: 'The correct answer from the provided options.'
      }
    },
    required: ['question', 'options', 'correctAnswer']
  }
};

const generateQuizAttempt = async (topic, difficulty, numberOfQuestions, fileContent = null) => {
  const ai = getAiClient(); // Initialize client and check for key here.
  let prompt = '';

  if (fileContent) {
    // Truncate file content to avoid exceeding API token limits. A large
    // document can easily go over the model's context window. This is a safeguard.
    const MAX_CONTENT_LENGTH = 500000;
    let processedContent = fileContent;
    if (processedContent.length > MAX_CONTENT_LENGTH) {
      console.warn(`File content was truncated to ${MAX_CONTENT_LENGTH} characters to fit within API token limits.`);
      processedContent = processedContent.substring(0, MAX_CONTENT_LENGTH);
    }

    prompt = `Generate a ${numberOfQuestions}-question multiple-choice quiz in JSON format based on the following document. The difficulty level should be "${difficulty}". The topic is derived from the document's content, but you can use "${topic}" as a hint for the topic. For each question, provide 4 options and identify the correct answer.\n\nDocument Content:\n"""\n${processedContent}\n"""`;
  } else {
    prompt = `Generate a ${numberOfQuestions}-question multiple-choice quiz in JSON format about "${topic}" with a difficulty level of "${difficulty}". For each question, provide 4 options and identify the correct answer.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: QUIZ_SCHEMA,
    },
  });

  const jsonText = response.text.trim();
  if (!jsonText) {
    throw new Error("The AI returned an empty response. It might be unable to generate a quiz for the given topic/document.");
  }
  
  const quizData = JSON.parse(jsonText);
  
  if (!Array.isArray(quizData) || quizData.length === 0) {
      throw new Error("Invalid quiz data format received from the API.");
  }

  return quizData;
};

export const generateQuiz = async (topic, difficulty, numberOfQuestions, fileContent = null) => {
  const MAX_RETRIES = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await generateQuizAttempt(topic, difficulty, numberOfQuestions, fileContent);
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} to generate quiz failed:`, error);
      
      // Do not retry on API key errors, as it's a fatal configuration issue.
      if (error.message.includes("API Key is not configured")) {
          break;
      }
      
      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error("All quiz generation attempts failed.", lastError);
  
  if (lastError) {
      if (lastError.message.includes("API Key is not configured")) {
          throw new Error("The Gemini API key is missing. The application is not configured correctly.");
      }
      if (lastError.message.includes('xhr') || lastError.message.includes('500') || lastError.message.includes('fetch')) {
        throw new Error("A network error occurred while generating the quiz. Please check your connection and try again.");
      }
      if (lastError.message.includes("empty response")) {
          throw new Error("The AI failed to generate a quiz for this topic. Please try a different topic or file.");
      }
  }
  
  throw new Error("Failed to generate the quiz after multiple attempts. Please try again later.");
};