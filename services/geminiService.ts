
import { GoogleGenAI } from "@google/genai";
import { TestResult } from '../types';

// Initializing Gemini client with environment API key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHealthInsights = async (result: TestResult) => {
  const prompt = `
    As a clinical laboratory assistant, explain the following test results to the patient in simple terms.
    Always include a disclaimer that this is an AI interpretation and they MUST consult their doctor.
    
    Test: ${result.testName}
    Results:
    ${result.parameters.map(p => `- ${p.name}: ${p.value} ${p.unit} (Ref: ${p.referenceRange})`).join('\n')}
    
    Remarks: ${result.doctorRemarks}
    
    Focus on clarity, empathy, and professional medical tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Extracting text output directly from the .text property
    return response.text || "No insights available for this specific report.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to provide AI insights at this time. Please speak with your doctor directly.";
  }
};
