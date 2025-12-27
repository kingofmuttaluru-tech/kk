
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
}

export interface TestResult {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  testName: string;
  date: string;
  parameters: TestParameter[];
  doctorRemarks: string;
}
