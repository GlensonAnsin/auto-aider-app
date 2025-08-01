import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY });

export async function verifyCar(make: string, model: string, year: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Is there a real car with the make '${make}', model '${model}', and year '${year}'? Respond with only "true" or "false". Be strict with spellings, if wrong spelling respond with "false".`.trim(),
        });
        return(response.text);
    } catch (e) {
        console.error("Error verifying car: ", e);
    }
}

export async function codeTechnicalDescription(code: string, car: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `What is the brief description of DTC ${code} from a ${car}? Provide only the brief description — no additional details.`.trim(),
            config: {
                temperature: 0,
            },
        });
        return(response.text);
    } catch (e) {
        console.error("Error getting technical description of the code: ", e);
    }
}

export async function codeMeaning(code: string, technicalDescription: string, car: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Provide a brief explanation of this DTC ${code} (${technicalDescription}) for a ${car}? Provide only the brief explanation — no additional details.`.trim(),
            config: {
                temperature: 0,
            },
        });
        return(response.text);
    } catch (e) {
        console.error("Error getting meaning of the code: ", e);
    }
}

export async function codePossibleCauses(code: string, technicalDescription: string, car: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `What are the possible causes of DTC ${code} (${technicalDescription}) for a ${car}? Provide only the possible causes in bullet form — no additional details.`.trim(),
            config: {
                temperature: 0,
            },
        });
        return(response.text);
    } catch (e) {
        console.error("Error getting possible causes of the code: ", e);
    }
}

export async function codeRecommendedRepair(code: string, technicalDescription: string, car: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `What are the recommended solutions or repairs of DTC ${code} (${technicalDescription}) for a ${car}? Provide only the recommended solutions or repairs in bullet form — no additional details.`.trim(),
            config: {
                temperature: 0,
            },
        });
        return(response.text);
    } catch (e) {
        console.error("Error getting recommended repair of the code: ", e);
    }
}