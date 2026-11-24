import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../src/models/User.model.js';
import Department from '../src/models/Department.model.js';
import Doctor from '../src/models/Doctor.model.js';
import Patient from '../src/models/Patient.model.js';
import Staff from '../src/models/Staff.model.js';
import Appointment from '../src/models/Appointment.model.js';
import MedicalRecord from '../src/models/MedicalRecord.model.js';
import Prescription from '../src/models/Prescription.model.js';
import Medicine from '../src/models/Medicine.model.js';
import LabTest from '../src/models/LabTest.model.js';
import Billing from '../src/models/Billing.model.js';
import Payment from '../src/models/Payment.model.js';
import Inventory from '../src/models/Inventory.model.js';
import { ROLES } from '../src/constants/roles.js';
import {
  APPOINTMENT_STATUS,
  PAYMENT_STATUS,
  LAB_TEST_STATUS,
  PRESCRIPTION_STATUS
} from '../src/constants/statuses.js';
import dayjs from 'dayjs';

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_management_system';

const seedDatabase = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB database:', mongoUri);

    // Clean existing database
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Staff.deleteMany({}),
      Appointment.deleteMany({}),
      MedicalRecord.deleteMany({}),
      Prescription.deleteMany({}),
      Medicine.deleteMany({}),
      LabTest.deleteMany({}),
      Billing.deleteMany({}),
      Payment.deleteMany({}),
      Inventory.deleteMany({})
    ]);

    console.log('[Seed] Creating demo users...');
    // Create Users (passwords will be automatically hashed by pre('save') hook)
    const adminUser = await User.create({
      name: 'Dr. Arthur Vance (Admin)',
      email: 'admin@hospital.com',
      password: 'Admin@123',
      role: ROLES.ADMIN,
      phone: '+1 555-0100',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150'
    });

    const doctorUser1 = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'doctor@hospital.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
      phone: '+1 555-0101',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'
    });

    const doctorUser2 = await User.create({
      name: 'Dr. Michael Chen',
      email: 'chen@hospital.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
      phone: '+1 555-0102',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'
    });

    const doctorUser3 = await User.create({
      name: 'Dr. Lisa Ray',
      email: 'ray@hospital.com',
      password: 'Doctor@123',
      role: ROLES.DOCTOR,
      phone: '+1 555-0103',
      avatar: 'https://images.unsplash.com/photo-1594824813627-775b42d50711?w=150'
    });

    const receptionistUser = await User.create({
      name: 'Emily Watson (Receptionist)',
      email: 'receptionist@hospital.com',
      password: 'Reception@123',
      role: ROLES.RECEPTIONIST,
      phone: '+1 555-0104',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    });

    const patientUser = await User.create({
      name: 'John Doe',
      email: 'patient@hospital.com',
      password: 'Patient@123',
      role: ROLES.PATIENT,
      phone: '+1 555-0105',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    });

    const pharmacistUser = await User.create({
      name: 'David Miller (Pharmacist)',
      email: 'pharmacist@hospital.com',
      password: 'Pharma@123',
      role: ROLES.PHARMACIST,
      phone: '+1 555-0106',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150'
    });

    const labUser = await User.create({
      name: 'Robert Vance (Lab Tech)',
      email: 'lab@hospital.com',
      password: 'Lab@123',
      role: ROLES.LAB_TECHNICIAN,
      phone: '+1 555-0107',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    });

    console.log('[Seed] Creating hospital departments...');
    const deptCardiology = await Department.create({
      name: 'Cardiology',
      code: 'CARD',
      description: 'Comprehensive cardiac care, diagnostics, and heart surgery.',
      location: 'Building A, Floor 2',
      contactNumber: '+1 555-1020'
    });

    const deptNeurology = await Department.create({
      name: 'Neurology',
      code: 'NEUR',
      description: 'Specialized treatment for brain, spinal cord, and nerve disorders.',
      location: 'Building B, Floor 3',
      contactNumber: '+1 555-1030'
    });

    const deptPediatrics = await Department.create({
      name: 'Pediatrics',
      code: 'PEDI',
      description: 'Compassionate medical care for infants, children, and adolescents.',
      location: 'Building A, Floor 1',
      contactNumber: '+1 555-1040'
    });

    const deptOrthopedics = await Department.create({
      name: 'Orthopedics',
      code: 'ORTH',
      description: 'Bone, joint, ligament, and spine rehabilitation & surgery.',
      location: 'Building C, Floor 1',
      contactNumber: '+1 555-1050'
    });

    const deptEmergency = await Department.create({
      name: 'Emergency Medicine',
      code: 'EMER',
      description: '24/7 rapid response trauma and urgent medical care.',
      location: 'Ground Floor, North Wing',
      contactNumber: '+1 555-1099'
    });

    console.log('[Seed] Creating doctors...');
    const doc1 = await Doctor.create({
      doctorId: 'DOC-2026-0001',
      user: doctorUser1._id,
      department: deptCardiology._id,
      specialization: 'Senior Interventional Cardiologist',
      qualification: 'MBBS, MD (Cardiology), FACC',
      experienceYears: 14,
      consultationFee: 120,
      roomNumber: 'Suite 204',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: { start: '09:00', end: '16:00' },
      biography: 'Expert in non-invasive cardiac imaging, angioplasty, and hypertension management.'
    });

    const doc2 = await Doctor.create({
      doctorId: 'DOC-2026-0002',
      user: doctorUser2._id,
      department: deptNeurology._id,
      specialization: 'Consultant Neurologist',
      qualification: 'MD, DM (Neurology)',
      experienceYears: 10,
      consultationFee: 110,
      roomNumber: 'Suite 310',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      workingHours: { start: '10:00', end: '17:00' },
      biography: 'Specialized in stroke rehabilitation, migraine therapy, and epilepsy management.'
    });

    const doc3 = await Doctor.create({
      doctorId: 'DOC-2026-0003',
      user: doctorUser3._id,
      department: deptPediatrics._id,
      specialization: 'Pediatric Specialist',
      qualification: 'MBBS, DCH, MD (Pediatrics)',
      experienceYears: 8,
      consultationFee: 90,
      roomNumber: 'Suite 105',
      availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      workingHours: { start: '08:30', end: '15:30' },
      biography: 'Dedicated to newborn care, childhood immunology, and developmental pediatrics.'
    });

    // Update head of department references
    deptCardiology.headOfDepartment = doc1._id;
    await deptCardiology.save();
    deptNeurology.headOfDepartment = doc2._id;
    await deptNeurology.save();

    console.log('[Seed] Creating hospital staff...');
    await Staff.create({
      staffId: 'STF-2026-0001',
      user: receptionistUser._id,
      department: deptEmergency._id,
      designation: 'Senior Front Desk Officer',
      shift: 'Morning',
      qualification: 'Bachelor of Healthcare Administration',
      salary: 42000
    });

    await Staff.create({
      staffId: 'STF-2026-0002',
      user: pharmacistUser._id,
      department: deptEmergency._id,
      designation: 'Chief Hospital Pharmacist',
      shift: 'Morning',
      qualification: 'Pharm.D, Registered Pharmacist',
      salary: 58000
    });

    await Staff.create({
      staffId: 'STF-2026-0003',
      user: labUser._id,
      department: deptEmergency._id,
      designation: 'Senior Medical Laboratory Technologist',
      shift: 'Morning',
      qualification: 'B.Sc Medical Laboratory Sciences',
      salary: 50000
    });

    console.log('[Seed] Creating patients...');
    const patient1 = await Patient.create({
      patientId: 'PAT-2026-0001',
      user: patientUser._id,
      name: 'John Doe',
      email: 'patient@hospital.com',
      phone: '+1 555-0105',
      dob: new Date('1988-04-12'),
      gender: 'Male',
      bloodGroup: 'O+',
      address: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62704',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Mary Doe',
        relationship: 'Spouse',
        phone: '+1 555-0199'
      },
      allergies: ['Penicillin', 'Peanuts'],
      chronicConditions: ['Hypertension']
    });

    const patient2 = await Patient.create({
      patientId: 'PAT-2026-0002',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 555-0202',
      dob: new Date('1995-09-23'),
      gender: 'Female',
      bloodGroup: 'A+',
      address: {
        street: '120 Elm Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'USA'
      },
      emergencyContact: {
        name: 'James Smith',
        relationship: 'Brother',
        phone: '+1 555-0288'
      },
      allergies: ['Aspirin'],
      chronicConditions: []
    });

    const patient3 = await Patient.create({
      patientId: 'PAT-2026-0003',
      name: 'Robert Johnson',
      email: 'r.johnson@example.com',
      phone: '+1 555-0303',
      dob: new Date('1965-02-14'),
      gender: 'Male',
      bloodGroup: 'B+',
      address: {
        street: '456 Oak Avenue',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702',
        country: 'USA'
      },
      allergies: [],
      chronicConditions: ['Type 2 Diabetes', 'Hyperlipidemia']
    });

    console.log('[Seed] Creating medicines...');
    const medAmox = await Medicine.create({
      medicineId: 'MED-2026-0001',
      name: 'Amoxicillin 500mg',
      genericName: 'Amoxicillin Trihydrate',
      category: 'Antibiotics',
      manufacturer: 'Pfizer Health',
      batchNumber: 'AMX-2026-88',
      expiryDate: dayjs().add(18, 'month').toDate(),
      purchasePrice: 6.5,
      sellingPrice: 14.0,
      stockQuantity: 140,
      reorderLevel: 25,
      unit: 'Capsule',
      locationRack: 'Shelf A-01'
    });

    const medAtor = await Medicine.create({
      medicineId: 'MED-2026-0002',
      name: 'Atorvastatin 20mg',
      genericName: 'Atorvastatin Calcium',
      category: 'Cardiovascular',
      manufacturer: 'Novartis',
      batchNumber: 'ATV-2026-12',
      expiryDate: dayjs().add(14, 'month').toDate(),
      purchasePrice: 8.0,
      sellingPrice: 18.5,
      stockQuantity: 95,
      reorderLevel: 20,
      unit: 'Tablet',
      locationRack: 'Shelf C-04'
    });

    const medParacetamol = await Medicine.create({
      medicineId: 'MED-2026-0003',
      name: 'Paracetamol 650mg',
      genericName: 'Acetaminophen',
      category: 'Analgesics',
      manufacturer: 'GSK Healthcare',
      batchNumber: 'PCM-2026-55',
      expiryDate: dayjs().add(24, 'month').toDate(),
      purchasePrice: 1.5,
      sellingPrice: 5.0,
      stockQuantity: 320,
      reorderLevel: 50,
      unit: 'Tablet',
      locationRack: 'Shelf A-03'
    });

    const medMetformin = await Medicine.create({
      medicineId: 'MED-2026-0004',
      name: 'Metformin 500mg',
      genericName: 'Metformin Hydrochloride',
      category: 'Antidiabetic',
      manufacturer: 'Merck Group',
      batchNumber: 'MET-2026-30',
      expiryDate: dayjs().add(12, 'month').toDate(),
      purchasePrice: 3.2,
      sellingPrice: 9.0,
      stockQuantity: 8, // Low stock trigger!
      reorderLevel: 20,
      unit: 'Tablet',
      locationRack: 'Shelf D-02'
    });

    const medOmeprazole = await Medicine.create({
      medicineId: 'MED-2026-0005',
      name: 'Omeprazole 20mg',
      genericName: 'Omeprazole Magnesium',
      category: 'Gastrointestinal',
      manufacturer: 'AstraZeneca',
      batchNumber: 'OMP-2026-09',
      expiryDate: dayjs().add(15, 'month').toDate(),
      purchasePrice: 4.0,
      sellingPrice: 11.0,
      stockQuantity: 6, // Low stock trigger!
      reorderLevel: 15,
      unit: 'Capsule',
      locationRack: 'Shelf B-01'
    });

    console.log('[Seed] Creating inventory supplies...');
    await Inventory.create({
      itemCode: 'INV-2026-0001',
      name: 'Sterile Surgical Gloves (Medium)',
      category: 'PPE',
      quantity: 450,
      unit: 'Pairs',
      minRequiredQuantity: 100,
      supplier: { name: 'MedSupply Co', phone: '+1 555-9001' },
      unitCost: 1.2,
      storageLocation: 'Supply Room 1, Shelf G'
    });

    await Inventory.create({
      itemCode: 'INV-2026-0002',
      name: 'Digital Sphygmomanometer',
      category: 'Medical Equipment',
      quantity: 12,
      unit: 'Pieces',
      minRequiredQuantity: 5,
      supplier: { name: 'HealthTech Instruments', phone: '+1 555-9002' },
      unitCost: 65,
      storageLocation: 'Equipment Locker 2'
    });

    await Inventory.create({
      itemCode: 'INV-2026-0003',
      name: 'N95 Respirator Masks',
      category: 'PPE',
      quantity: 8, // Low stock alert!
      unit: 'Boxes',
      minRequiredQuantity: 20,
      supplier: { name: 'SafeCare Supplies', phone: '+1 555-9003' },
      unitCost: 22,
      storageLocation: 'Main Storage Bay 3'
    });

    console.log('[Seed] Creating appointments...');
    const today = dayjs().startOf('day').toDate();

    const apt1 = await Appointment.create({
      appointmentNumber: 'APT-2026-0001',
      patient: patient1._id,
      doctor: doc1._id,
      department: deptCardiology._id,
      appointmentDate: today,
      timeSlot: '09:30 AM',
      type: 'General',
      status: APPOINTMENT_STATUS.CONFIRMED,
      reason: 'Routine cardiovascular checkup and blood pressure monitoring',
      fee: doc1.consultationFee,
      paymentStatus: PAYMENT_STATUS.PAID
    });

    const apt2 = await Appointment.create({
      appointmentNumber: 'APT-2026-0002',
      patient: patient2._id,
      doctor: doc2._id,
      department: deptNeurology._id,
      appointmentDate: today,
      timeSlot: '11:00 AM',
      type: 'General',
      status: APPOINTMENT_STATUS.IN_CONSULTATION,
      reason: 'Recurrent morning migraine headaches and light sensitivity',
      fee: doc2.consultationFee,
      paymentStatus: PAYMENT_STATUS.UNPAID
    });

    const apt3 = await Appointment.create({
      appointmentNumber: 'APT-2026-0003',
      patient: patient3._id,
      doctor: doc1._id,
      department: deptCardiology._id,
      appointmentDate: dayjs().add(2, 'day').startOf('day').toDate(),
      timeSlot: '10:00 AM',
      type: 'Follow-up',
      status: APPOINTMENT_STATUS.PENDING,
      reason: 'Post-medication lipid profile review',
      fee: doc1.consultationFee,
      paymentStatus: PAYMENT_STATUS.UNPAID
    });

    console.log('[Seed] Creating medical records...');
    await MedicalRecord.create({
      recordNumber: 'REC-2026-0001',
      patient: patient1._id,
      doctor: doc1._id,
      appointment: apt1._id,
      visitDate: today,
      vitals: {
        bloodPressure: '128/82',
        heartRate: 74,
        temperature: 98.4,
        respiratoryRate: 16,
        oxygenSaturation: 99,
        weightKg: 78,
        heightCm: 178
      },
      symptoms: ['Mild exertional fatigue', 'Occasional palpitations'],
      diagnosis: 'Stage 1 Essential Hypertension (Well Controlled)',
      clinicalNotes: 'Patient adhering well to dietary sodium restriction. ECG demonstrates normal sinus rhythm with no ST changes.',
      treatmentPlan: 'Maintain current regimen of Atorvastatin and lifestyle modifications. Review in 3 months.',
      allergiesNoted: ['Penicillin', 'Peanuts'],
      followUpDate: dayjs().add(90, 'day').toDate()
    });

    console.log('[Seed] Creating prescriptions...');
    await Prescription.create({
      prescriptionNumber: 'RX-2026-0001',
      patient: patient1._id,
      doctor: doc1._id,
      appointment: apt1._id,
      diagnosis: 'Essential Hypertension & Hyperlipidemia',
      medicines: [
        {
          medicine: medAtor._id,
          name: 'Atorvastatin 20mg',
          dosage: '20mg',
          frequency: 'Once daily at bedtime',
          duration: '30 days',
          instructions: 'Take with or without food. Avoid grapefruit juice.'
        },
        {
          medicine: medParacetamol._id,
          name: 'Paracetamol 650mg',
          dosage: '650mg',
          frequency: 'As needed (SOS)',
          duration: '5 days',
          instructions: 'Take after meals for mild headaches, max 3 times daily.'
        }
      ],
      generalAdvice: 'Limit daily dietary salt intake. 30 minutes of brisk walking 5 days a week.',
      status: PRESCRIPTION_STATUS.ISSUED
    });

    console.log('[Seed] Creating laboratory tests...');
    await LabTest.create({
      testNumber: 'LAB-2026-0001',
      patient: patient1._id,
      doctor: doc1._id,
      appointment: apt1._id,
      testName: 'Comprehensive Lipid Profile',
      category: 'Biochemistry',
      priority: 'Routine',
      sampleType: 'Serum',
      status: LAB_TEST_STATUS.COMPLETED,
      technician: labUser._id,
      results: [
        { parameter: 'Total Cholesterol', value: '185', unit: 'mg/dL', normalRange: '< 200', status: 'Normal' },
        { parameter: 'Triglycerides', value: '142', unit: 'mg/dL', normalRange: '< 150', status: 'Normal' },
        { parameter: 'HDL (Good)', value: '52', unit: 'mg/dL', normalRange: '> 40', status: 'Normal' },
        { parameter: 'LDL (Bad)', value: '104', unit: 'mg/dL', normalRange: '< 100', status: 'Abnormal' }
      ],
      price: 55,
      requestedDate: dayjs().subtract(1, 'day').toDate(),
      completedDate: today
    });

    await LabTest.create({
      testNumber: 'LAB-2026-0002',
      patient: patient2._id,
      doctor: doc2._id,
      appointment: apt2._id,
      testName: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      priority: 'Urgent',
      sampleType: 'Whole Blood',
      status: LAB_TEST_STATUS.IN_PROGRESS,
      price: 40,
      requestedDate: today
    });

    console.log('[Seed] Creating billing invoices & payments...');
    const bill1 = await Billing.create({
      invoiceNumber: 'INV-2026-0001',
      patient: patient1._id,
      appointment: apt1._id,
      items: [
        {
          description: 'Specialist Cardiology Consultation',
          category: 'Consultation',
          quantity: 1,
          unitPrice: 120,
          amount: 120
        },
        {
          description: 'Comprehensive Lipid Panel',
          category: 'Laboratory',
          quantity: 1,
          unitPrice: 55,
          amount: 55
        }
      ],
      subtotal: 175,
      taxRate: 5,
      taxAmount: 8.75,
      discountAmount: 0,
      totalAmount: 183.75,
      paidAmount: 183.75,
      balanceAmount: 0,
      paymentStatus: PAYMENT_STATUS.PAID,
      dueDate: dayjs().add(14, 'day').toDate(),
      createdBy: adminUser._id
    });

    await Payment.create({
      receiptNumber: 'REC-PAY-2026-0001',
      billing: bill1._id,
      patient: patient1._id,
      amount: 183.75,
      paymentMethod: 'Card',
      transactionId: 'TXN-98421455',
      notes: 'Visa card ending in 4242',
      paymentDate: today,
      receivedBy: receptionistUser._id
    });

    await Billing.create({
      invoiceNumber: 'INV-2026-0002',
      patient: patient2._id,
      appointment: apt2._id,
      items: [
        {
          description: 'Neurology Consultation',
          category: 'Consultation',
          quantity: 1,
          unitPrice: 110,
          amount: 110
        },
        {
          description: 'Complete Blood Count (CBC)',
          category: 'Laboratory',
          quantity: 1,
          unitPrice: 40,
          amount: 40
        }
      ],
      subtotal: 150,
      taxRate: 5,
      taxAmount: 7.5,
      discountAmount: 0,
      totalAmount: 157.5,
      paidAmount: 0,
      balanceAmount: 157.5,
      paymentStatus: PAYMENT_STATUS.UNPAID,
      dueDate: dayjs().add(14, 'day').toDate(),
      createdBy: receptionistUser._id
    });

    console.log('\n===============================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('===============================================================');
    console.log('Demo Credentials:');
    console.log('  👨‍💼 Admin:        admin@hospital.com        / Admin@123');
    console.log('  👨‍⚕️ Doctor:       doctor@hospital.com       / Doctor@123');
    console.log('  👩‍💼 Receptionist: receptionist@hospital.com / Reception@123');
    console.log('  🧑‍🦽 Patient:      patient@hospital.com      / Patient@123');
    console.log('  💊 Pharmacist:    pharmacist@hospital.com   / Pharma@123');
    console.log('  🔬 Lab Tech:      lab@hospital.com          / Lab@123');
    console.log('===============================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
