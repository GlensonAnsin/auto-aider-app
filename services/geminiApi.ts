import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY });

export async function verifyCar(make: string, model: string, year: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-05-20",
            contents: `Is there a real car with the make '${make}', model '${model}', and year '${year}'? Respond with only "true" or "false".`.trim(),
        });
        return(response.text);
    } catch (e) {
        console.error("Error verifying car: ", e)
    }
}