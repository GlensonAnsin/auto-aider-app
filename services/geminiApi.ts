import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY });

export async function verifyCar(make: string, model: string, year: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Is there a real car with the make '${make}', model '${model}', and year '${year}'? Respond with only "true" or "false".`.trim(),
        });
        return(response.text);
    } catch (e) {
        console.error("Error verifying car: ", e);
    }
}

export async function codeTechnicalDescription(code: string, year: string, make: string, model: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `What is the technical description of DTC ${code} from a ${year} ${make} ${model}? Provide only the technical description — no additional details.`.trim(),
        });
        return(response.text);
    } catch (e) {
        console.error("Error getting technical description of the code: ", e);
    }
}

export async function codeMeaning(code: string, technicalDescription: string, year: string, make: string, model: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `What is the full meaning of DTC ${code} (${technicalDescription}) for a ${year} ${make} ${model}? Provide only the full meaning — no additional details.`.trim(),
        });
        return(response.text);
    } catch (e) {
        console.error("Error getting meaning of the code: ", e);
    }
}

export async function codePossibleCauses(code: string, technicalDescription: string, year: string, make: string, model: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `What are the possible causes of DTC ${code} (${technicalDescription}) for a ${year} ${make} ${model}? Provide only the possible causes — no additional details.`.trim(),
        });
        return(response.text);
    } catch (e) {
        console.error("Error getting possible causes of the code: ", e);
    }
}

export async function codeRecommendedRepair(code: string, technicalDescription: string, year: string, make: string, model: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `What are the recommended solutions or repairs of DTC ${code} (${technicalDescription}) for a ${year} ${make} ${model}? Provide only the recommended solutions or repairs — no additional details.`.trim(),
        });
        return(response.text);
    } catch (e) {
        console.error("Error getting recommended repair of the code: ", e);
    }
}