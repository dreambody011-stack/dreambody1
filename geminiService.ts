import { GoogleGenAI } from "@google/genai";

export const generateFitnessAdvice = async (
  query: string,
  userContext: string
): Promise<string> => {
  const apiKey = process.env.API_KEY;

  // Graceful fallback if no API key is present in environment
  if (!apiKey) {
    console.warn("No API_KEY found. Using mock response.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          "I'm currently running in offline mode because the API Key is missing. Typically, I would analyze your request: \"" +
            query +
            "\" based on your profile and provide expert advice. Please contact the owner to configure the AI integration."
        );
      }, 1000);
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Using the recommended model for text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User Context: ${userContext}\n\nUser Question: ${query}`,
      config: {
        systemInstruction: "You are a professional, motivating, and elite fitness coach for 'Dream Body'. Keep answers concise, actionable, and encouraging. Use metric units.",
      }
    });

    return response.text || "I couldn't generate a response at the moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the fitness mainframe right now. Please try again later.";
  }
};
