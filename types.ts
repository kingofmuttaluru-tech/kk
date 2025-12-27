
export enum UserRole {
  PATIENT = 'PATIENT',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface DiagnosticService {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
}

export interface TestParameter {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  method?: string;
  section?: string; // e.g., 'HAEMOGRAM', 'LEUKOCYTE COUNT'
}

export interface TestResult {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  age: string;
  gender: string;
  refDoctor: string;
  sampleType: string;
  collectedAt: string;
  receivedAt: string;
  testName: string;
  date: string;
  parameters: TestParameter[];
  doctorRemarks: string;
  analyzerUsed?: string;
  internalQC?: string;
  morphology?: string;
}
