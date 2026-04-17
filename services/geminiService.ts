import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, QuizType, Difficulty } from '../types.ts';
import { getGeminiApiKey } from './config.ts';

/**
 * Initializes the GoogleGenAI client.
 * This function retrieves the API key from the config file.
 * @returns An instance of the GoogleGenAI client.
 * @throws An error if the API key is not configured.
 */
const getAiClient = () => {
    const apiKey = getGeminiApiKey();
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
      questionType: {
        type: Type.STRING,
        description: 'One of: Multiple Choice, Identification, True or False.'
      },
      difficulty: {
        type: Type.STRING,
        description: 'One of: Easy, Medium, Hard.'
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Options for the question. For Identification this should be an empty array. For True or False it should be ["True","False"]. For Multiple Choice it should have 4 options.'
      },
      correctAnswer: {
        type: Type.STRING,
        description: 'The correct answer from the provided options.'
      }
    },
    required: ['question', 'options', 'correctAnswer', 'questionType', 'difficulty']
  }
};

const generateQuizAttempt = async (
  topic: string,
  difficulty: Difficulty,
  quizType: QuizType,
  numberOfQuestions: number,
  fileContent: string | null = null
): Promise<QuizQuestion[]> => {
  const ai = getAiClient(); // Initialize client and check for key here.
  let prompt = '';
  const quizTypeInstruction =
    quizType === QuizType.MULTIPLE_CHOICE
      ? 'Multiple Choice'
      : quizType === QuizType.TRUE_OR_FALSE
        ? 'True or False'
        : 'Identification';

  if (fileContent) {
    // Truncate file content to avoid exceeding API token limits. A large
    // document can easily go over the model's context window. This is a safeguard.
    const MAX_CONTENT_LENGTH = 500000;
    let processedContent = fileContent;
    if (processedContent.length > MAX_CONTENT_LENGTH) {
      console.warn(`File content was truncated to ${MAX_CONTENT_LENGTH} characters to fit within API token limits.`);
      processedContent = processedContent.substring(0, MAX_CONTENT_LENGTH);
    }

    prompt =
      `Generate a ${numberOfQuestions}-question quiz in JSON format based on the following document.\n` +
      `Quiz type: "${quizTypeInstruction}".\n` +
      `Difficulty: "${difficulty}".\n` +
      `The topic is derived from the document's content, but you can use "${topic}" as a hint.\n\n` +
      `Rules:\n` +
      `- Return an array of question objects.\n` +
      `- Each object MUST include: question, questionType, difficulty, options, correctAnswer.\n` +
      `- If questionType is "Multiple Choice": options MUST contain 4 choices and correctAnswer MUST be one of them.\n` +
      `- If questionType is "True or False": options MUST be ["True","False"] and correctAnswer MUST be exactly "True" or "False".\n` +
      `- If questionType is "Identification": options MUST be [] and correctAnswer MUST be a short string.\n\n` +
      `Document Content:\n"""\n${processedContent}\n"""`;
  } else {
    prompt =
      `Generate a ${numberOfQuestions}-question quiz in JSON format about "${topic}".\n` +
      `Quiz type: "${quizTypeInstruction}".\n` +
      `Difficulty: "${difficulty}".\n\n` +
      `Rules:\n` +
      `- Return an array of question objects.\n` +
      `- Each object MUST include: question, questionType, difficulty, options, correctAnswer.\n` +
      `- If questionType is "Multiple Choice": options MUST contain 4 choices and correctAnswer MUST be one of them.\n` +
      `- If questionType is "True or False": options MUST be ["True","False"] and correctAnswer MUST be exactly "True" or "False".\n` +
      `- If questionType is "Identification": options MUST be [] and correctAnswer MUST be a short string.\n`;
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

  const typed = quizData as QuizQuestion[];
  // Ensure each question carries the selected config (so scoring/rendering stays consistent)
  return typed.map((q) => ({
    ...q,
    questionType: q.questionType || quizType,
    difficulty: q.difficulty || difficulty,
    options: Array.isArray(q.options) ? q.options : [],
  }));
};

export const generateQuiz = async (
  topic: string,
  difficulty: Difficulty,
  quizType: QuizType,
  numberOfQuestions: number,
  fileContent: string | null = null
): Promise<QuizQuestion[]> => {
  const MAX_RETRIES = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await generateQuizAttempt(topic, difficulty, quizType, numberOfQuestions, fileContent);
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt} to generate quiz failed:`, error);
      
      // Do not retry on API key errors, as it's a fatal configuration issue.
      if (error.message.includes("VITE_GEMINI_API_KEY") || error.message.includes("400")) {
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
      if (lastError.message.includes("VITE_GEMINI_API_KEY") || lastError.message.includes('400') || lastError.message.includes('API key not valid')) {
          throw new Error("Your Gemini API key is missing or invalid. Set VITE_GEMINI_API_KEY in your environment and try again.");
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