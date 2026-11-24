# AuraCare Hospital Management System (HMS) – Full Stack MERN Application

AuraCare HMS is an enterprise-grade, modern, and production-ready Hospital Management System built with the **MERN** stack (MongoDB, Express.js, React.js with TypeScript, Node.js).

Designed with a clean medical aesthetic, responsive layouts, secure JWT authentication with refresh token rotation, granular role-based authorization (Admin, Doctor, Receptionist, Patient, Pharmacist, Lab Technician), and real-time MongoDB database integration.

---

## 🌟 Key Features & Modules

### 1. Role-Based Dashboards & Access Control
- **👨‍💼 Administrator**:
  - Full system oversight, total patient/doctor counts, bed occupancy, hospital revenue charts.
  - CRUD operations for Doctors, Departments, Staff, Inventory, and Patient registries.
  - Financial disclosures, revenue collection summaries, and tax reporting.
- **👨‍⚕️ Doctor**:
  - Daily appointment queue with 1-click status transitions (`Start Visit`, `Completed`, `Cancelled`).
  - Electronic Medical Records (EMR) charting: vitals recording (BP, pulse, temp, SpO2, weight), symptoms, diagnosis, treatment notes.
  - Prescription issuing with dosage, frequency, and instructions.
  - Direct diagnostic laboratory test requests.
- **👩‍💼 Receptionist**:
  - Fast patient check-in and walk-in registration.
  - Appointment scheduling with collision-prevention time slot picker.
  - Real-time doctor duty directory and room availability glance.
  - Billing invoice generation and payment receipt collection.
- **🧑‍🦽 Patient**:
  - Self-service portal: view medical history, vital trends, and doctor clinical notes.
  - Book appointments with specialty and physician slot selection.
  - Access active prescriptions and downloadable laboratory reports.
  - View invoices, track payment status, and settle bills.
- **💊 Pharmacist**:
  - Drug formulary catalog with batch tracking, packaging units, and expiry warnings.
  - Prescription dispensing queue with automated stock deduction upon fulfillment.
  - Reorder point notifications for low stock medications.
- **🔬 Laboratory Technician**:
  - Diagnostic test order queue prioritized by urgency (`Routine`, `Urgent`, `Stat`).
  - Specimen lifecycle tracking (`Requested` &rarr; `Sample-Collected` &rarr; `In-Progress` &rarr; `Completed`).
  - Record numerical biological parameters against normal reference ranges.

---

## ⚡ Demo Credentials (1-Click Switcher Available on Login)

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@hospital.com` | `Admin@123` |
| **Doctor (Cardiology)** | `doctor@hospital.com` | `Doctor@123` |
| **Doctor (Neurology)** | `chen@hospital.com` | `Doctor@123` |
| **Receptionist** | `receptionist@hospital.com` | `Reception@123` |
| **Patient** | `patient@hospital.com` | `Patient@123` |
| **Pharmacist** | `pharmacist@hospital.com` | `Pharma@123` |
| **Laboratory Technician** | `lab@hospital.com` | `Lab@123` |

> [!TIP]
> The Login page includes a **1-Click Quick Demo Login Switcher** at the bottom of the form to immediately log in as any role without manual typing.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript & Vite
- **Styling**: Tailwind CSS with custom healthcare palette
- **State Management**: Redux Toolkit & React-Redux
- **Routing**: React Router DOM (v7) with role-protected route guards
- **API Client**: Axios with request/response interceptors & token refresh
- **Data Visualization**: Recharts (Revenue Bar charts & Department Donut charts)
- **Icons**: React Icons (FontAwesome)
- **Notifications**: React Hot Toast
- **Dates**: Day.js

### Backend
- **Runtime**: Node.js v22 (ES Modules `"type": "module"`)
- **Web Framework**: Express.js
- **Database & ODM**: MongoDB with Mongoose (ObjectId references, indexes, validators)
- **Authentication**: JWT (Access Token + Refresh Token rotation with HTTP-only cookies)
- **Password Security**: bcryptjs (10 salt rounds with pre-save hashing)
- **Security Middleware**: Helmet, CORS, Express Rate Limit
- **File Uploads**: Multer (local disk storage with Cloudinary support)

---

## 📁 Project Architecture

```
d:\Hospital Management System\
├── backend/
│   ├── src/
│   │   ├── config/             # db.js, cloudinary.js
│   │   ├── constants/          # roles.js, statuses.js
│   │   ├── controllers/        # 14 domain controllers
│   │   ├── middleware/         # auth, role, error, upload
│   │   ├── models/             # 13 Mongoose models
│   │   ├── routes/             # Express route endpoints
│   │   ├── utils/              # ApiResponse, ApiError, asyncHandler, tokenUtils
│   │   ├── app.js              # Express app setup & security
│   │   └── server.js           # Server listen & DB connection
│   ├── seed/
│   │   └── seed.js             # Comprehensive realistic data seeder
│   ├── uploads/                # Uploaded attachments & avatars
│   ├── .env                    # Environment config
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # StatCard, StatusBadge, LoadingSpinner, EmptyState, ConfirmDialog
│   │   │   ├── layout/         # Sidebar, Navbar, DashboardLayout, RoleRoute
│   │   │   ├── forms/          # FormInput, FormSelect, FormTextarea
│   │   │   ├── tables/         # DataTable, Pagination, SearchInput
│   │   │   └── modals/         # Reusable Modal dialog
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── admin/          # AdminDashboard
│   │   │   ├── doctor/         # DoctorDashboard
│   │   │   ├── receptionist/   # ReceptionistDashboard
│   │   │   ├── patient/        # PatientDashboard
│   │   │   ├── pharmacy/       # PharmacyDashboard, PharmacyPage
│   │   │   ├── laboratory/     # LabDashboard, LaboratoryPage
│   │   │   ├── appointments/   # AppointmentsPage, BookAppointmentPage
│   │   │   ├── patients/       # PatientsPage, PatientDetailPage
│   │   │   ├── doctors/        # DoctorsPage
│   │   │   ├── departments/    # DepartmentsPage
│   │   │   ├── medical-records/# MedicalRecordsPage
│   │   │   ├── prescriptions/  # PrescriptionsPage
│   │   │   ├── billing/        # BillingPage
│   │   │   ├── staff/          # StaffPage
│   │   │   ├── inventory/      # InventoryPage
│   │   │   ├── reports/        # ReportsPage
│   │   │   └── profile/        # ProfilePage
│   │   ├── routes/             # AppRoutes
│   │   ├── services/           # Axios instance & domain APIs
│   │   ├── store/              # Redux Toolkit store & authSlice
│   │   ├── types/              # Domain interfaces
│   │   ├── utils/              # formatters.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── package.json
└── README.md
```
## 📡 RESTful API Documentation Summary

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue tokens | Public |
| `POST` | `/api/auth/refresh-token` | Rotate refresh token & issue new access token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `GET` | `/api/dashboard/admin` | Hospital executive KPIs & charts | Admin |
| `GET` | `/api/dashboard/doctor` | Daily clinic queue & statistics | Doctor |
| `GET` | `/api/dashboard/patient` | Personal health portal overview | Patient |
| `GET` | `/api/patients` | List patients with search & blood filters | Staff/Doctors |
| `GET` | `/api/patients/:id/history` | Full patient medical history timeline | Staff/Doctors |
| `POST` | `/api/patients` | Register new patient | Reception/Admin |
| `GET` | `/api/doctors` | List doctors by specialty & department | Authenticated |
| `GET` | `/api/doctors/:id/availability` | Check available slots on target date | Authenticated |
| `GET` | `/api/appointments` | List appointments with filters | Authenticated |
| `POST` | `/api/appointments` | Book appointment with duplicate prevention | Authenticated |
| `PATCH`| `/api/appointments/:id/status`| Update status (`Confirmed`, `Completed`, etc.) | Staff/Doctors |
| `GET` | `/api/departments` | List hospital clinical departments | Authenticated |
| `GET` | `/api/medical-records` | List examination notes & vitals | Staff/Doctors |
| `POST` | `/api/medical-records` | Record diagnosis, vitals, & treatment | Doctor/Admin |
| `GET` | `/api/prescriptions` | List medication orders | Authenticated |
| `POST` | `/api/prescriptions` | Formulate & issue drug prescription | Doctor/Admin |
| `PATCH`| `/api/prescriptions/:id/dispense`| Dispense drugs & decrement inventory | Pharmacist/Admin |
| `GET` | `/api/pharmacy` | List formulary drugs with low stock flag | Authenticated |
| `POST` | `/api/pharmacy` | Catalog new pharmaceutical SKU | Pharmacist/Admin |
| `GET` | `/api/laboratory` | List diagnostic test requests | Authenticated |
| `PUT` | `/api/laboratory/:id/results`| Submit biological test parameter results | Lab Tech/Admin |
| `GET` | `/api/billing` | List patient invoices | Authenticated |
| `POST` | `/api/billing` | Generate itemized hospital invoice | Reception/Admin |
| `POST` | `/api/payments` | Record payment settlement against bill | Reception/Admin |
| `GET` | `/api/inventory` | List equipment & supplies | Authenticated |
| `PATCH`| `/api/inventory/:id/restock` | Restock inventory quantity | Pharmacist/Admin |
| `GET` | `/api/reports/financial` | Revenue, collection & tax reports | Admin |
| `GET` | `/api/reports/demographics` | Patient demographic distribution | Admin |
