import api from './api';
import type {
  ApiResponse,
  User,
  Doctor,
  Patient,
  Department,
  Appointment,
  MedicalRecord,
  Prescription,
  Medicine,
  LabTest,
  Billing,
  Payment,
  Staff,
  InventoryItem
} from '../types';

export const authApi = {
  login: (data: any) => api.post<ApiResponse<{ user: User; profile: any; accessToken: string; refreshToken: string }>>('/auth/login', data),
  register: (data: any) => api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/register', data),
  logout: () => api.post<ApiResponse<null>>('/auth/logout'),
  getMe: () => api.get<ApiResponse<{ user: User; profile: any }>>('/auth/me'),
  updateProfile: (data: any) => api.put<ApiResponse<User>>('/auth/profile', data),
  changePassword: (data: any) => api.put<ApiResponse<null>>('/auth/change-password', data),
  forgotPassword: (email: string) => api.post<ApiResponse<any>>('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post<ApiResponse<null>>('/auth/reset-password', data),
};

export const dashboardApi = {
  getAdmin: () => api.get<ApiResponse<any>>('/dashboard/admin'),
  getDoctor: () => api.get<ApiResponse<any>>('/dashboard/doctor'),
  getPatient: () => api.get<ApiResponse<any>>('/dashboard/patient'),
  getReceptionist: () => api.get<ApiResponse<any>>('/dashboard/receptionist'),
  getPharmacist: () => api.get<ApiResponse<any>>('/dashboard/pharmacist'),
  getLaboratory: () => api.get<ApiResponse<any>>('/dashboard/laboratory'),
};

export const patientApi = {
  getAll: (params?: any) => api.get<ApiResponse<Patient[]>>('/patients', { params }),
  getById: (id: string) => api.get<ApiResponse<Patient>>(`/patients/${id}`),
  getHistory: (id: string) => api.get<ApiResponse<any>>(`/patients/${id}/history`),
  create: (data: any) => api.post<ApiResponse<Patient>>('/patients', data),
  update: (id: string, data: any) => api.put<ApiResponse<Patient>>(`/patients/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/patients/${id}`),
};

export const doctorApi = {
  getAll: (params?: any) => api.get<ApiResponse<Doctor[]>>('/doctors', { params }),
  getById: (id: string) => api.get<ApiResponse<Doctor>>(`/doctors/${id}`),
  getAvailability: (id: string, date: string) => api.get<ApiResponse<any>>(`/doctors/${id}/availability`, { params: { date } }),
  create: (data: any) => api.post<ApiResponse<Doctor>>('/doctors', data),
  update: (id: string, data: any) => api.put<ApiResponse<Doctor>>(`/doctors/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/doctors/${id}`),
};

export const departmentApi = {
  getAll: () => api.get<ApiResponse<Department[]>>('/departments'),
  getById: (id: string) => api.get<ApiResponse<{ department: Department; doctors: Doctor[] }>>(`/departments/${id}`),
  create: (data: any) => api.post<ApiResponse<Department>>('/departments', data),
  update: (id: string, data: any) => api.put<ApiResponse<Department>>(`/departments/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/departments/${id}`),
};

export const appointmentApi = {
  getAll: (params?: any) => api.get<ApiResponse<Appointment[]>>('/appointments', { params }),
  getById: (id: string) => api.get<ApiResponse<Appointment>>(`/appointments/${id}`),
  create: (data: any) => api.post<ApiResponse<Appointment>>('/appointments', data),
  update: (id: string, data: any) => api.put<ApiResponse<Appointment>>(`/appointments/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status }),
  cancel: (id: string) => api.delete<ApiResponse<Appointment>>(`/appointments/${id}`),
};

export const medicalRecordApi = {
  getAll: (params?: any) => api.get<ApiResponse<MedicalRecord[]>>('/medical-records', { params }),
  getById: (id: string) => api.get<ApiResponse<MedicalRecord>>(`/medical-records/${id}`),
  create: (data: any) => api.post<ApiResponse<MedicalRecord>>('/medical-records', data),
  update: (id: string, data: any) => api.put<ApiResponse<MedicalRecord>>(`/medical-records/${id}`, data),
};

export const prescriptionApi = {
  getAll: (params?: any) => api.get<ApiResponse<Prescription[]>>('/prescriptions', { params }),
  getById: (id: string) => api.get<ApiResponse<Prescription>>(`/prescriptions/${id}`),
  create: (data: any) => api.post<ApiResponse<Prescription>>('/prescriptions', data),
  dispense: (id: string) => api.patch<ApiResponse<Prescription>>(`/prescriptions/${id}/dispense`),
};

export const pharmacyApi = {
  getAll: (params?: any) => api.get<ApiResponse<Medicine[]>>('/pharmacy', { params }),
  getById: (id: string) => api.get<ApiResponse<Medicine>>(`/pharmacy/${id}`),
  getAlerts: () => api.get<ApiResponse<{ lowStock: Medicine[]; expiringSoon: Medicine[] }>>('/pharmacy/alerts'),
  create: (data: any) => api.post<ApiResponse<Medicine>>('/pharmacy', data),
  update: (id: string, data: any) => api.put<ApiResponse<Medicine>>(`/pharmacy/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/pharmacy/${id}`),
};

export const labApi = {
  getAll: (params?: any) => api.get<ApiResponse<LabTest[]>>('/laboratory', { params }),
  getById: (id: string) => api.get<ApiResponse<LabTest>>(`/laboratory/${id}`),
  create: (data: any) => api.post<ApiResponse<LabTest>>('/laboratory', data),
  submitResults: (id: string, data: any) => api.put<ApiResponse<LabTest>>(`/laboratory/${id}/results`, data),
  updateStatus: (id: string, status: string) => api.patch<ApiResponse<LabTest>>(`/laboratory/${id}/status`, { status }),
};

export const billingApi = {
  getAll: (params?: any) => api.get<ApiResponse<Billing[]>>('/billing', { params }),
  getById: (id: string) => api.get<ApiResponse<{ bill: Billing; payments: Payment[] }>>(`/billing/${id}`),
  create: (data: any) => api.post<ApiResponse<Billing>>('/billing', data),
  updateStatus: (id: string, paymentStatus: string) => api.patch<ApiResponse<Billing>>(`/billing/${id}/status`, { paymentStatus }),
};

export const paymentApi = {
  getAll: (params?: any) => api.get<ApiResponse<Payment[]>>('/payments', { params }),
  getById: (id: string) => api.get<ApiResponse<Payment>>(`/payments/${id}`),
  record: (data: any) => api.post<ApiResponse<Payment>>('/payments', data),
};

export const staffApi = {
  getAll: (params?: any) => api.get<ApiResponse<Staff[]>>('/staff', { params }),
  getById: (id: string) => api.get<ApiResponse<Staff>>(`/staff/${id}`),
  create: (data: any) => api.post<ApiResponse<Staff>>('/staff', data),
  update: (id: string, data: any) => api.put<ApiResponse<Staff>>(`/staff/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/staff/${id}`),
};

export const inventoryApi = {
  getAll: (params?: any) => api.get<ApiResponse<InventoryItem[]>>('/inventory', { params }),
  getById: (id: string) => api.get<ApiResponse<InventoryItem>>(`/inventory/${id}`),
  create: (data: any) => api.post<ApiResponse<InventoryItem>>('/inventory', data),
  update: (id: string, data: any) => api.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, data),
  restock: (id: string, quantityToAdd: number) => api.patch<ApiResponse<InventoryItem>>(`/inventory/${id}/restock`, { quantityToAdd }),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/inventory/${id}`),
};

export const reportsApi = {
  getFinancial: (params?: any) => api.get<ApiResponse<any>>('/reports/financial', { params }),
  getAppointments: (params?: any) => api.get<ApiResponse<any>>('/reports/appointments', { params }),
  getDemographics: () => api.get<ApiResponse<any>>('/reports/demographics'),
};
