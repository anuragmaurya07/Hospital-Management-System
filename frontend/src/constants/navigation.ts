import {
  FaChartPie,
  FaUserMd,
  FaUserInjured,
  FaCalendarAlt,
  FaHospital,
  FaFileInvoiceDollar,
  FaPills,
  FaFlask,
  FaBoxes,
  FaUserShield,
  FaFileMedicalAlt,
  FaChartBar,
  FaCog
} from 'react-icons/fa';
import type { Role } from '../types';

export interface NavItem {
  name: string;
  path: string;
  icon: any;
}

export const NAVIGATION_BY_ROLE: Record<Role, NavItem[]> = {
  admin: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FaChartPie },
    { name: 'Patients', path: '/patients', icon: FaUserInjured },
    { name: 'Doctors', path: '/doctors', icon: FaUserMd },
    { name: 'Departments', path: '/departments', icon: FaHospital },
    { name: 'Appointments', path: '/appointments', icon: FaCalendarAlt },
    { name: 'Billing & Invoices', path: '/billing', icon: FaFileInvoiceDollar },
    { name: 'Pharmacy', path: '/pharmacy', icon: FaPills },
    { name: 'Laboratory', path: '/laboratory', icon: FaFlask },
    { name: 'Inventory', path: '/inventory', icon: FaBoxes },
    { name: 'Staff Management', path: '/staff', icon: FaUserShield },
    { name: 'Reports & Analytics', path: '/reports', icon: FaChartBar },
  ],
  doctor: [
    { name: 'My Dashboard', path: '/doctor/dashboard', icon: FaChartPie },
    { name: 'Appointments', path: '/appointments', icon: FaCalendarAlt },
    { name: 'Patients', path: '/patients', icon: FaUserInjured },
    { name: 'Medical Records', path: '/medical-records', icon: FaFileMedicalAlt },
    { name: 'Prescriptions', path: '/prescriptions', icon: FaPills },
    { name: 'Lab Requests', path: '/laboratory', icon: FaFlask },
  ],
  receptionist: [
    { name: 'Dashboard', path: '/receptionist/dashboard', icon: FaChartPie },
    { name: 'Appointments', path: '/appointments', icon: FaCalendarAlt },
    { name: 'Patients', path: '/patients', icon: FaUserInjured },
    { name: 'Doctor Directory', path: '/doctors', icon: FaUserMd },
    { name: 'Billing & Invoices', path: '/billing', icon: FaFileInvoiceDollar },
  ],
  patient: [
    { name: 'Health Portal', path: '/patient/dashboard', icon: FaChartPie },
    { name: 'Book Appointment', path: '/appointments/book', icon: FaCalendarAlt },
    { name: 'My Appointments', path: '/appointments', icon: FaCalendarAlt },
    { name: 'My Prescriptions', path: '/prescriptions', icon: FaPills },
    { name: 'Lab Reports', path: '/laboratory', icon: FaFlask },
    { name: 'Invoices & Receipts', path: '/billing', icon: FaFileInvoiceDollar },
  ],
  pharmacist: [
    { name: 'Pharmacy Hub', path: '/pharmacist/dashboard', icon: FaChartPie },
    { name: 'Medicines Inventory', path: '/pharmacy', icon: FaPills },
    { name: 'Prescription Orders', path: '/prescriptions', icon: FaFileMedicalAlt },
    { name: 'Hospital Supplies', path: '/inventory', icon: FaBoxes },
  ],
  lab_technician: [
    { name: 'Lab Dashboard', path: '/laboratory/dashboard', icon: FaChartPie },
    { name: 'Test Requests', path: '/laboratory', icon: FaFlask },
    { name: 'Patient Directory', path: '/patients', icon: FaUserInjured },
  ],
};
