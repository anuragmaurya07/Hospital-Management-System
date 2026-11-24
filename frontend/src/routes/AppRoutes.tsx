import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { RoleRoute } from '../components/layout/RoleRoute';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';

// Dashboards
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { DoctorDashboard } from '../pages/doctor/DoctorDashboard';
import { ReceptionistDashboard } from '../pages/receptionist/ReceptionistDashboard';
import { PatientDashboard } from '../pages/patient/PatientDashboard';
import { PharmacyDashboard } from '../pages/pharmacy/PharmacyDashboard';
import { LabDashboard } from '../pages/laboratory/LabDashboard';

// Modules
import { AppointmentsPage } from '../pages/appointments/AppointmentsPage';
import { BookAppointmentPage } from '../pages/appointments/BookAppointmentPage';
import { PatientsPage } from '../pages/patients/PatientsPage';
import { PatientDetailPage } from '../pages/patients/PatientDetailPage';
import { DoctorsPage } from '../pages/doctors/DoctorsPage';
import { DepartmentsPage } from '../pages/departments/DepartmentsPage';
import { MedicalRecordsPage } from '../pages/medical-records/MedicalRecordsPage';
import { PrescriptionsPage } from '../pages/prescriptions/PrescriptionsPage';
import { PharmacyPage } from '../pages/pharmacy/PharmacyPage';
import { LaboratoryPage } from '../pages/laboratory/LaboratoryPage';
import { BillingPage } from '../pages/billing/BillingPage';
import { StaffPage } from '../pages/staff/StaffPage';
import { InventoryPage } from '../pages/inventory/InventoryPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';

export const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const getDefaultDashboard = () => {
    if (!user) return '/login';
    const map: Record<string, string> = {
      admin: '/admin/dashboard',
      doctor: '/doctor/dashboard',
      receptionist: '/receptionist/dashboard',
      patient: '/patient/dashboard',
      pharmacist: '/pharmacist/dashboard',
      lab_technician: '/laboratory/dashboard',
    };
    return map[user.role] || '/login';
  };

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getDefaultDashboard()} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={getDefaultDashboard()} replace /> : <Register />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Layout Routes */}
      <Route
        path="/"
        element={
          <RoleRoute>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to={getDefaultDashboard()} replace />} />

        {/* Role Dashboards */}
        <Route
          path="admin/dashboard"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="doctor/dashboard"
          element={
            <RoleRoute allowedRoles={['doctor', 'admin']}>
              <DoctorDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="receptionist/dashboard"
          element={
            <RoleRoute allowedRoles={['receptionist', 'admin']}>
              <ReceptionistDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="patient/dashboard"
          element={
            <RoleRoute allowedRoles={['patient', 'admin']}>
              <PatientDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="pharmacist/dashboard"
          element={
            <RoleRoute allowedRoles={['pharmacist', 'admin']}>
              <PharmacyDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="laboratory/dashboard"
          element={
            <RoleRoute allowedRoles={['lab_technician', 'admin']}>
              <LabDashboard />
            </RoleRoute>
          }
        />

        {/* Operational Modules */}
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="appointments/book" element={<BookAppointmentPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/:id" element={<PatientDetailPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="medical-records" element={<MedicalRecordsPage />} />
        <Route path="prescriptions" element={<PrescriptionsPage />} />
        <Route path="pharmacy" element={<PharmacyPage />} />
        <Route path="laboratory" element={<LaboratoryPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route
          path="staff"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <StaffPage />
            </RoleRoute>
          }
        />
        <Route
          path="reports"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <ReportsPage />
            </RoleRoute>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
