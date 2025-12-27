
import { GoogleGenAI } from "@google/genai";
import { TestResult } from '../types';

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
    return response.text || "No insights available for this specific report.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to provide AI insights at this time.";
  }
};

export const getWholeHealthSummary = async (results: TestResult[]) => {
  if (results.length === 0) return "No medical records found to summarize.";

  const summaryData = results.map(r => `
    Date: ${r.date}
    Test: ${r.testName}
    Key Findings: ${r.parameters.slice(0, 3).map(p => `${p.name}: ${p.value} ${p.unit}`).join(', ')}
    Doctor Remarks: ${r.doctorRemarks}
  `).join('\n---\n');

  const prompt = `
    Analyze the following medical history of a patient from Sri Venkateswar Clinical Laboratory.
    Provide a concise "Whole Health Summary" (max 150 words).
    1. Summarize the general health status based on recent trends.
    2. Highlight any parameters that show significant changes or remain outside reference ranges.
    3. Suggest general wellness tips (e.g., diet, hydration).
    
    Patient Records:
    ${summaryData}
    
    IMPORTANT: Start with a clear medical disclaimer. Use a supportive and professional tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Health summary is currently unavailable.";
  }
};
