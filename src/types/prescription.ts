export type Medication =
  | 'Amoxicillin'
  | 'Metronidazole'
  | 'Dihydrocodeine'
  | 'Duraphat';

export interface PrescriptionEntry {
  prescriptionNumber: number; // 1-50
  date: string;
  practitionerInitials: string;
  surgeryNumber: string;
  serialNumber: string; // 11-digit pre-printed number
  medication: Medication;
  patientInitials: string;
  filled: boolean;
}

export interface PrescriptionPad {
  padNumber: number;
  prescriptions: Map<number, PrescriptionEntry>;
}

export interface AuditReport {
  totalPrescriptions: number;
  medicationCounts: Record<Medication, number>;
  dailyBreakdown: Record<string, number>;
  prescriptions: PrescriptionEntry[];
}
