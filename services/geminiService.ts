
import { GoogleGenAI, Type } from "@google/genai";
import { GardenTheme } from "../types";

// Always use the API key directly from process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMoodGardenTheme = async (mood: string): Promise<GardenTheme> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a visual theme for a 3D garden based on the mood: "${mood}". 
                 Provide a color palette and a brief poetic description of the atmosphere.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryColor: { type: Type.STRING, description: "HEX color for flowers" },
            secondaryColor: { type: Type.STRING, description: "HEX color for accent features" },
            groundColor: { type: Type.STRING, description: "HEX color for the grass/ground" },
            skyColor: { type: Type.STRING, description: "HEX color for the horizon/sky" },
            moodDescription: { type: Type.STRING, description: "Poetic 1-sentence description" }
          },
          required: ["primaryColor", "secondaryColor", "groundColor", "skyColor", "moodDescription"]
        }
      }
    });

    // Extracting text from response.text property (not a method)
    const data = JSON.parse(response.text);
    return data as GardenTheme;
  } catch (error) {
    console.error("Error generating garden theme:", error);
    // Fallback theme
    return {
      primaryColor: "#ff7eb9",
      secondaryColor: "#7afcff",
      groundColor: "#2d5a27",
      skyColor: "#87ceeb",
      moodDescription: "A gentle, blooming sanctuary of peace."
    };
  }
};
