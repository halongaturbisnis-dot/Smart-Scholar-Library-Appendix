import { GoogleGenAI, Type, Schema } from "@google/genai";
import { VisualData, VisualType, SlideDeck, AppLanguage } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- Helpers ---

// Helper to convert File to base64 for Gemini
export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      resolve(result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

// --- Summary Service ---

export const generateSmartSummary = async (
  textInput: string, 
  file: File | null,
  language: AppLanguage
): Promise<string> => {
  const modelId = 'gemini-2.5-flash'; 

  const parts: any[] = [];
  
  if (file) {
    const filePart = await fileToGenerativePart(file);
    parts.push(filePart);
  }
  
  if (textInput) {
    parts.push({ text: `Source content URL/Text: ${textInput}` });
  }

  const langInstruction = language === 'ID' 
    ? "Bahasa: Buat seluruh output dalam BAHASA INDONESIA yang baku dan formal." 
    : "Language: Create the entire output in ENGLISH.";

  const prompt = `
    You are an expert academic research assistant named "Smart Scholar".
    Analyze the provided document or text.
    
    Task:
    1. Create a comprehensive summary of the content.
    2. Format the output in clean Markdown.
    3. BOLD important keywords and concepts using **asterisks**.
    4. ${language === 'ID' ? 'Jika ada istilah asing/teknis, berikan penjelasan singkat dalam kurung.' : 'If there are technical terms, provide a brief simple explanation in parentheses.'}
    5. Structure with clear headings (H2, H3).
    6. Ensure the tone is professional yet accessible to a non-expert.
    7. ${langInstruction}
  `;

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        temperature: 0.3,
      }
    });

    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Summary generation error:", error);
    throw error;
  }
};

export const generateVisualData = async (summaryText: string, language: AppLanguage): Promise<VisualData> => {
  const modelId = 'gemini-2.5-flash';

  const langInstruction = language === 'ID' 
    ? "Ensure all titles and labels are in Bahasa Indonesia." 
    : "Ensure all titles and labels are in English.";

  const prompt = `
    Analyze this summary and decide the best way to visualize the MAIN insight.
    ${langInstruction}
    
    Options:
    1. If it describes a process, workflow, hierarchy, or timeline, return a "PROCESS" type.
    2. If it contains comparable numerical data (statistics, growth, distribution), return a "CHART" type.
    3. If neither is strong, return "NONE".

    Output JSON adhering to the schema.
  `;

  const visualSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, enum: [VisualType.PROCESS, VisualType.CHART, VisualType.NONE] },
      title: { type: Type.STRING, description: "Title of the diagram" },
      steps: {
        type: Type.ARRAY,
        description: "Only if type is PROCESS. An ordered list of steps.",
        items: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.INTEGER },
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          }
        }
      },
      chartData: {
        type: Type.ARRAY,
        description: "Only if type is CHART. Data points.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            value: { type: Type.NUMBER }
          }
        }
      },
      chartLabel: { type: Type.STRING, description: "Label for the values (e.g., 'Percentage', 'Revenue')" }
    },
    required: ["type", "title"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: summaryText }, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: visualSchema,
        temperature: 0.2
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as VisualData;
    }
    throw new Error("Empty response for visualization");

  } catch (error) {
    console.error("Visualization error:", error);
    return { type: VisualType.NONE, title: "" };
  }
};

// --- Slide Service ---

export const generateSlideDeck = async (
  content: string, 
  file: File | null,
  customInstructions: string,
  language: AppLanguage
): Promise<SlideDeck> => {
  const modelId = 'gemini-2.5-flash';
  
  const parts: any[] = [];

  if (file) {
    parts.push(await fileToGenerativePart(file));
  }
  parts.push({ text: `Source Content: ${content}` });
  parts.push({ text: `User Custom Instructions: ${customInstructions}` });

  const langInstruction = language === 'ID' 
  ? "Generate all slide content in Bahasa Indonesia." 
  : "Generate all slide content in English.";

  const prompt = `
    Act as a professional presentation designer. Create a slide deck based on the source content.
    Follow the user's custom instructions for style/tone if provided.
    ${langInstruction}
    
    The output must be a valid JSON object representing the slides.
    Structure:
    - 5 to 8 slides.
    - Slide 1 is always the Title Slide.
    - Provide speaker notes for each slide.
    - Choose a theme color hex code and font style suggestion.
  `;

  parts.push({ text: prompt });

  const slideSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      themeColor: { type: Type.STRING, description: "A hex color code suitable for the theme (e.g. #1e3a8a)" },
      fontStyle: { type: Type.STRING, description: "Suggested font family name (e.g. 'Inter', 'Serif')" },
      slides: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            title: { type: Type.STRING },
            bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            footer: { type: Type.STRING },
            speakerNotes: { type: Type.STRING },
            layout: { type: Type.STRING, enum: ["title", "content", "split"] }
          },
          required: ["id", "title", "bullets", "layout", "speakerNotes"]
        }
      }
    },
    required: ["themeColor", "fontStyle", "slides"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: slideSchema,
        temperature: 0.4 
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as SlideDeck;
    }
    throw new Error("Empty response for slides");
  } catch (error) {
    console.error("Slide generation error:", error);
    throw error;
  }
};