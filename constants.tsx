
import { DiagnosticService } from './types';

export const CATEGORIES = [
  'Hematology',
  'Biochemistry',
  'Serology',
  'Clinical Pathology',
  'Hormone Tests',
];

export const SERVICES: DiagnosticService[] = [
  { 
    id: 'b1', 
    name: 'Complete Blood Picture (CBC)', 
    category: 'Hematology', 
    description: 'Measures Hb, WBC, RBC, and Platelet counts.', 
    price: 300 
  },
  { 
    id: 'bc1', 
    name: 'Liver Function Test (LFT)', 
    category: 'Biochemistry', 
    description: 'Comprehensive panel to assess liver health and enzymes.', 
    price: 500 
  },
  { 
    id: 'bc2', 
    name: 'Renal Function Test (RFT)', 
    category: 'Biochemistry', 
    description: 'Tests for Urea, Creatinine, and Electrolytes to check kidney health.', 
    price: 500 
  },
  { 
    id: 'b3', 
    name: 'Lipid Profile', 
    category: 'Biochemistry', 
    description: 'Measures Cholesterol, Triglycerides, HDL, and LDL levels.', 
    price: 500 
  },
  { 
    id: 'b4', 
    name: 'HbA1c (Glycated Hemoglobin)', 
    category: 'Biochemistry', 
    description: 'Average blood sugar levels over the past 3 months.', 
    price: 600 
  },
  { 
    id: 'h1', 
    name: 'Thyroid Profile', 
    category: 'Hormone Tests', 
    description: 'Assesses Thyroid stimulating hormone and thyroid activity.', 
    price: 500 
  },
  { 
    id: 'u1', 
    name: 'Urine Routine', 
    category: 'Clinical Pathology', 
    description: 'Physical, chemical, and microscopic examination of urine.', 
    price: 100 
  },
  { 
    id: 'cp1', 
    name: 'BT & CT (Bleeding & Clotting Time)', 
    category: 'Clinical Pathology', 
    description: 'Screening test for blood coagulation disorders.', 
    price: 100 
  },
  { 
    id: 's1', 
    name: 'HBsAg (Hepatitis B)', 
    category: 'Serology', 
    description: 'Screening for Hepatitis B surface antigen.', 
    price: 300 
  },
  { 
    id: 's2', 
    name: 'HIV I & II', 
    category: 'Serology', 
    description: 'Screening for Human Immunodeficiency Virus antibodies.', 
    price: 300 
  },
  { 
    id: 's3', 
    name: 'HCV (Hepatitis C)', 
    category: 'Serology', 
    description: 'Screening for Hepatitis C Virus antibodies.', 
    price: 300 
  },
  { 
    id: 's4', 
    name: 'VDRL', 
    category: 'Serology', 
    description: 'Screening test for syphilis infection.', 
    price: 200 
  }
];

export const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM'
];

export const TEST_TEMPLATES: Record<string, { name: string; analyzer?: string; params: { name: string; unit: string; referenceRange: string; method: string; section?: string }[] }> = {
  'CBC': {
    name: 'COMPLETE BLOOD PICTURE (CBP)',
    analyzer: 'Automated Hematology Analyzer (Sysmex)',
    params: [
      { section: 'HAEMOGRAM', name: 'Hemoglobin (Hb)', unit: 'g/dL', referenceRange: 'M: 13.0–17.0, F: 12.0–15.0', method: 'Cyanmethaemoglobin' },
      { section: 'HAEMOGRAM', name: 'Total RBC Count', unit: 'million/µL', referenceRange: 'M: 4.5–5.9, F: 4.1–5.1', method: 'Electrical Impedance' },
      { section: 'HAEMOGRAM', name: 'Hematocrit (PCV)', unit: '%', referenceRange: 'M: 40–52, F: 36–48', method: 'Calculated' },
      { section: 'HAEMOGRAM', name: 'MCV', unit: 'fL', referenceRange: '80–100', method: 'Calculated' },
      { section: 'HAEMOGRAM', name: 'MCH', unit: 'pg', referenceRange: '27–33', method: 'Calculated' },
      { section: 'HAEMOGRAM', name: 'MCHC', unit: 'g/dL', referenceRange: '32–36', method: 'Calculated' },
      { section: 'HAEMOGRAM', name: 'RDW-CV', unit: '%', referenceRange: '11.5–14.5', method: 'Calculated' },
      { section: 'TOTAL LEUKOCYTE COUNT', name: 'Total WBC Count', unit: 'cells/µL', referenceRange: '4,000–11,000', method: 'Electrical Impedance' },
      { section: 'DIFFERENTIAL LEUKOCYTE COUNT', name: 'Neutrophils', unit: '%', referenceRange: '40–75', method: 'Flow Cytometry' },
      { section: 'DIFFERENTIAL LEUKOCYTE COUNT', name: 'Lymphocytes', unit: '%', referenceRange: '20–45', method: 'Flow Cytometry' },
      { section: 'DIFFERENTIAL LEUKOCYTE COUNT', name: 'Monocytes', unit: '%', referenceRange: '2–10', method: 'Flow Cytometry' },
      { section: 'DIFFERENTIAL LEUKOCYTE COUNT', name: 'Eosinophils', unit: '%', referenceRange: '1–6', method: 'Flow Cytometry' },
      { section: 'DIFFERENTIAL LEUKOCYTE COUNT', name: 'Basophils', unit: '%', referenceRange: '0–1', method: 'Flow Cytometry' },
      { section: 'PLATELET PROFILE', name: 'Platelet Count', unit: '/µL', referenceRange: '150,000–450,000', method: 'Electrical Impedance' },
      { section: 'PLATELET PROFILE', name: 'MPV', unit: 'fL', referenceRange: '7.5–11.5', method: 'Calculated' }
    ]
  },
  'SUGAR': {
    name: 'Blood Sugar Tests',
    analyzer: 'Bio-Chemistry Analyzer',
    params: [
      { name: 'Fasting Blood Sugar', unit: 'mg/dL', referenceRange: '70–99', method: 'GOD-PAP' },
      { name: 'Post-meal (PPBS)', unit: 'mg/dL', referenceRange: '<140', method: 'GOD-PAP' },
      { name: 'HbA1c', unit: '%', referenceRange: '<5.7', method: 'HPLC' }
    ]
  }
};
