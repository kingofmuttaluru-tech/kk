
import { DiagnosticService } from './types';

export const CATEGORIES = [
  'Blood Tests',
  'Urine Tests',
  'Sputum Tests',
  'Hormone Tests',
  'Vitamin Tests',
  'Clinical Pathology',
  'Microbiology',
  'Biochemistry'
];

export const SERVICES: DiagnosticService[] = [
  { id: 'b1', name: 'Complete Blood Count (CBC)', category: 'Blood Tests', description: 'Comprehensive panel measuring red cells, white cells, and platelets.', price: 350 },
  { id: 'b2', name: 'Blood Sugar (Fasting/PP)', category: 'Blood Tests', description: 'Measures blood glucose levels to screen for diabetes.', price: 150 },
  { id: 'b3', name: 'Lipid Profile', category: 'Blood Tests', description: 'Measures cholesterol and triglyceride levels.', price: 600 },
  { id: 'u1', name: 'Routine Urine Analysis', category: 'Urine Tests', description: 'Basic screening for kidney function and infection.', price: 200 },
  { id: 'u2', name: 'Urine Culture & Sensitivity', category: 'Urine Tests', description: 'Identifies bacteria causing urinary tract infections.', price: 550 },
  { id: 's1', name: 'Sputum for AFB', category: 'Sputum Tests', description: 'Tests for acid-fast bacilli (typically TB screening).', price: 400 },
  { id: 'h1', name: 'Thyroid Profile (T3, T4, TSH)', category: 'Hormone Tests', description: 'Assesses thyroid gland activity.', price: 750 },
  { id: 'h2', name: 'Testosterone Total', category: 'Hormone Tests', description: 'Measures primary male sex hormone levels.', price: 850 },
  { id: 'v1', name: 'Vitamin D (25-OH)', category: 'Vitamin Tests', description: 'Checks for Vitamin D deficiency.', price: 1200 },
  { id: 'v2', name: 'Vitamin B12', category: 'Vitamin Tests', description: 'Measures Vitamin B12 levels in blood.', price: 900 },
  { id: 'cp1', name: 'Stool Examination', category: 'Clinical Pathology', description: 'Screening for parasites or hidden blood.', price: 250 },
  { id: 'm1', name: 'Widal Test', category: 'Microbiology', description: 'Diagnostic test for typhoid fever.', price: 300 },
  { id: 'bc1', name: 'Liver Function Test (LFT)', category: 'Biochemistry', description: 'Assesses health of your liver.', price: 800 },
  { id: 'bc2', name: 'Kidney Function Test (KFT)', category: 'Biochemistry', description: 'Assesses health of your kidneys.', price: 700 }
];

export const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM'
];

export const TEST_TEMPLATES: Record<string, { name: string; params: { name: string; unit: string; referenceRange: string }[] }> = {
  'CBC': {
    name: 'Complete Blood Count (CBC)',
    params: [
      { name: 'Hemoglobin (Hb)', unit: 'g/dL', referenceRange: 'M: 13–17, F: 12–15' },
      { name: 'RBC', unit: 'million/µL', referenceRange: 'M: 4.5–5.9, F: 4.1–5.1' },
      { name: 'WBC (Total)', unit: '/µL', referenceRange: '4,000–11,000' },
      { name: 'Platelets', unit: '/µL', referenceRange: '150,000–450,000' },
      { name: 'Hematocrit (HCT)', unit: '%', referenceRange: 'M: 40–52, F: 36–48' },
      { name: 'MCV', unit: 'fL', referenceRange: '80–100' }
    ]
  },
  'SUGAR': {
    name: 'Blood Sugar Tests',
    params: [
      { name: 'Fasting Blood Sugar', unit: 'mg/dL', referenceRange: '70–99' },
      { name: 'Post-meal (PPBS)', unit: 'mg/dL', referenceRange: '<140' },
      { name: 'Random Blood Sugar', unit: 'mg/dL', referenceRange: '<200' },
      { name: 'HbA1c', unit: '%', referenceRange: '<5.7' }
    ]
  },
  'LIPID': {
    name: 'Lipid Profile',
    params: [
      { name: 'Total Cholesterol', unit: 'mg/dL', referenceRange: '<200' },
      { name: 'LDL (Bad)', unit: 'mg/dL', referenceRange: '<100' },
      { name: 'HDL (Good)', unit: 'mg/dL', referenceRange: 'M: >40, F: >50' },
      { name: 'Triglycerides', unit: 'mg/dL', referenceRange: '<150' }
    ]
  },
  'LFT': {
    name: 'Liver Function Test (LFT)',
    params: [
      { name: 'SGOT (AST)', unit: 'U/L', referenceRange: '5–40' },
      { name: 'SGPT (ALT)', unit: 'U/L', referenceRange: '7–56' },
      { name: 'ALP', unit: 'U/L', referenceRange: '44–147' },
      { name: 'Total Bilirubin', unit: 'mg/dL', referenceRange: '0.3–1.2' },
      { name: 'Albumin', unit: 'g/dL', referenceRange: '3.5–5.5' }
    ]
  },
  'KFT': {
    name: 'Kidney Function Test (KFT)',
    params: [
      { name: 'Creatinine', unit: 'mg/dL', referenceRange: '0.6–1.3' },
      { name: 'Urea', unit: 'mg/dL', referenceRange: '15–40' },
      { name: 'Uric Acid', unit: 'mg/dL', referenceRange: 'M: 3.5–7.2, F: 2.6–6.0' },
      { name: 'Sodium', unit: 'mEq/L', referenceRange: '135–145' },
      { name: 'Potassium', unit: 'mEq/L', referenceRange: '3.5–5.0' }
    ]
  },
  'THYROID': {
    name: 'Thyroid Tests',
    params: [
      { name: 'TSH', unit: 'mIU/L', referenceRange: '0.4–4.0' },
      { name: 'Free T3', unit: 'pg/mL', referenceRange: '2.3–4.2' },
      { name: 'Free T4', unit: 'ng/dL', referenceRange: '0.8–1.8' }
    ]
  },
  'VITAMINS': {
    name: 'Vitamins & Minerals',
    params: [
      { name: 'Vitamin D', unit: 'ng/mL', referenceRange: '30–100' },
      { name: 'Vitamin B12', unit: 'pg/mL', referenceRange: '200–900' },
      { name: 'Calcium', unit: 'mg/dL', referenceRange: '8.6–10.2' }
    ]
  },
  'URINE': {
    name: 'Routine Urine Exam',
    params: [
      { name: 'Color', unit: 'n/a', referenceRange: 'Pale yellow' },
      { name: 'pH', unit: 'n/a', referenceRange: '4.5–8.0' },
      { name: 'Protein', unit: 'n/a', referenceRange: 'Negative' },
      { name: 'Glucose', unit: 'n/a', referenceRange: 'Negative' },
      { name: 'Ketones', unit: 'n/a', referenceRange: 'Negative' },
      { name: 'RBC', unit: '/HPF', referenceRange: '0–2' },
      { name: 'WBC', unit: '/HPF', referenceRange: '0–5' },
      { name: 'Bacteria', unit: 'n/a', referenceRange: 'Absent' }
    ]
  },
  'HORMONES': {
    name: 'Hormone Test Panel',
    params: [
      { name: 'Testosterone (M)', unit: 'ng/dL', referenceRange: '300–1000' },
      { name: 'Testosterone (F)', unit: 'ng/dL', referenceRange: '15–70' },
      { name: 'Prolactin', unit: 'ng/mL', referenceRange: '4–23' },
      { name: 'FSH', unit: 'mIU/mL', referenceRange: '4–10' },
      { name: 'LH', unit: 'mIU/mL', referenceRange: '5–20' },
      { name: 'Cortisol (AM)', unit: 'µg/dL', referenceRange: '5–25' }
    ]
  }
};
