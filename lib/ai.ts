import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyCjBAPDM5-55Vg8TvvUsVkk-ZkdVFepkn0";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Summarizes a post description using Gemini AI
 * @param description - The original post description to summarize
 * @param maxLength - Maximum length of the summary (default: 150 characters)
 * @returns Promise containing the summarized text
 */
export async function summarizeText(
  description: string,
  maxLength: number = 150,
): Promise<string> {
  try {
    // For text-only input, use the gemini-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-flash" });

    const prompt = `Please provide a short and concise summary of the following text. 
    The summary should be no longer than ${maxLength} characters:
    
    ${description}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Return the summary or truncate if needed
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  } catch (error) {
    console.error("Error summarizing text with Gemini:", error);

    // Return a truncated version of the original as fallback
    return description.length > maxLength
      ? description.substring(0, maxLength) + "..."
      : description;
  }
}

/**
 * Answers a frequently asked question using Gemini AI
 * @param question - The user's question
 * @param locality - The user's locality for context (optional)
 * @returns Promise containing the AI response
 */
export async function answerFAQ(
  question: string,
  locality: string = ""
): Promise<string> {
  try {
    // Use gemini-flash model for FAQ answering as well
    const model = genAI.getGenerativeModel({ model: "gemini-flash" });

    let prompt = `You are an AI assistant for a community engagement platform called LocalVoice. 
Users can create and participate in events, polls, petitions, and discussions with others in their locality.

${locality ? `The user asking this question is from the locality of ${locality}.` : ""}

Answer the following question clearly and concisely, providing specific information relevant to community engagement:

${question}

When answering:
- Focus on practical advice about community engagement
- If the question is about events, petitions, polls, or discussions, provide specific actionable tips
- If the locality was provided, mention it in your answer when relevant
- Keep your tone helpful and encouraging`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error("Error answering FAQ with Gemini:", error);

    return "Sorry, I was unable to answer your question at this time.";
  }
}
