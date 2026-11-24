export type Role =
  | 'admin'
  | 'doctor'
  | 'receptionist'
  | 'patient'
  | 'pharmacist'
  | 'lab_technician';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: {
    _id: string;
    user?: { name: string; email: string; avatar?: string };
    specialization?: string;
  };
  location?: string;
  contactNumber?: string;
  doctorCount?: number;
  isActive: boolean;
}

export interface Doctor {
  _id: string;
  doctorId: string;
  user: User;
  department: Department;
  specialization: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  roomNumber: string;
  availableDays: string[];
  workingHours: { start: string; end: string };
  slotDurationMinutes: number;
  biography?: string;
  isActive: boolean;
}

export interface Patient {
  _id: string;
  patientId: string;
  user?: User | string | null;
  name: string;
  email?: string;
  phone: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  allergies?: string[];
  chronicConditions?: string[];
  insurance?: {
    provider?: string;
    policyNumber?: string;
    coverageAmount?: number;
    validUntil?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface Staff {
  _id: string;
  staffId: string;
  user: User;
  department?: Department;
  designation: string;
  shift: 'Morning' | 'Evening' | 'Night' | 'Rotational';
  qualification?: string;
  salary?: number;
  joiningDate?: string;
  status: 'Active' | 'On-Leave' | 'Resigned' | 'Terminated';
}

export interface Appointment {
  _id: string;
  appointmentNumber: string;
  patient: Patient;
  doctor: Doctor;
  department: Department;
  appointmentDate: string;
  timeSlot: string;
  type: 'General' | 'Follow-up' | 'Emergency' | 'Routine Checkup';
  status: 'Pending' | 'Confirmed' | 'In-Consultation' | 'Completed' | 'Cancelled' | 'No-Show';
  reason: string;
  notes?: string;
  fee: number;
  paymentStatus: 'Unpaid' | 'Partially-Paid' | 'Paid';
  createdAt: string;
}

export interface Vitals {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weightKg?: number;
  heightCm?: number;
}

export interface MedicalRecord {
  _id: string;
  recordNumber: string;
  patient: Patient;
  doctor: Doctor;
  appointment?: Appointment;
  visitDate: string;
  vitals: Vitals;
  symptoms: string[];
  diagnosis: string;
  clinicalNotes?: string;
  treatmentPlan?: string;
  allergiesNoted?: string[];
  followUpDate?: string;
  attachments?: { name: string; url: string; fileType: string; uploadedAt: string }[];
  createdAt: string;
}

export interface PrescriptionItem {
  _id?: string;
  medicine?: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  _id: string;
  prescriptionNumber: string;
  patient: Patient;
  doctor: Doctor;
  appointment?: Appointment;
  diagnosis?: string;
  medicines: PrescriptionItem[];
  generalAdvice?: string;
  status: 'Issued' | 'Dispensed' | 'Cancelled';
  dispensedBy?: User;
  dispensedAt?: string;
  createdAt: string;
}

export interface Medicine {
  _id: string;
  medicineId: string;
  name: string;
  genericName?: string;
  category: string;
  manufacturer?: string;
  batchNumber: string;
  expiryDate: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  unit: string;
  locationRack?: string;
  isActive: boolean;
}

export interface LabResultParameter {
  _id?: string;
  parameter: string;
  value: string;
  unit?: string;
  normalRange?: string;
  status: 'Normal' | 'Abnormal' | 'Critical';
}

export interface LabTest {
  _id: string;
  testNumber: string;
  patient: Patient;
  doctor: Doctor;
  appointment?: Appointment;
  testName: string;
  category: string;
  priority: 'Routine' | 'Urgent' | 'Stat';
  sampleType: string;
  status: 'Requested' | 'Sample-Collected' | 'In-Progress' | 'Completed' | 'Cancelled';
  technician?: User;
  results?: LabResultParameter[];
  reportFile?: string;
  notes?: string;
  price?: number;
  requestedDate: string;
  completedDate?: string;
}

export interface BillingItem {
  _id?: string;
  description: string;
  category: 'Consultation' | 'Laboratory' | 'Pharmacy' | 'Room' | 'Procedure' | 'Nursing' | 'Other';
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Billing {
  _id: string;
  invoiceNumber: string;
  patient: Patient;
  appointment?: Appointment;
  items: BillingItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: 'Unpaid' | 'Partially-Paid' | 'Paid';
  dueDate: string;
  createdBy?: User;
  createdAt: string;
}

export interface Payment {
  _id: string;
  receiptNumber: string;
  billing: Billing;
  patient: Patient;
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'NetBanking' | 'Insurance';
  transactionId?: string;
  notes?: string;
  paymentDate: string;
  receivedBy?: User;
}

export interface InventoryItem {
  _id: string;
  itemCode: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minRequiredQuantity: number;
  supplier?: {
    name?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
  };
  unitCost: number;
  storageLocation: string;
  lastRestocked: string;
  status: 'In-Stock' | 'Low-Stock' | 'Out-of-Stock';
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}
