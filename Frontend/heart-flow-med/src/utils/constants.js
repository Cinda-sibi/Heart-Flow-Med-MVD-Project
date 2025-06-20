export const NAVIGATION_ITEMS = {
  patient: [
    { name: 'Dashboard', path: '/patient/dashboard', icon: 'LayoutDashboard' },
    { name: 'Appointments', path: '/patient/appointments', icon: 'Calendar' },
    { name: 'Medical Records', path: '/patient/records', icon: 'FileText' },
    { name: 'Prescriptions', path: '/patient/prescriptions', icon: 'Pill' },
    { name: 'Test Results', path: '/patient/results', icon: 'Activity' },
    { name: 'Messages', path: '/patient/messages', icon: 'MessageSquare' },
    { name: 'Profile', path: '/patient/profile', icon: 'User' }
  ],
  cardiologist: [
    { name: 'Dashboard', path: '/cardiologist/dashboard', icon: 'LayoutDashboard' },
    { name: 'Patients', path: '/cardiologist/patients', icon: 'Users' },
    { name: 'Appointments', path: '/cardiologist/appointments', icon: 'Calendar' },
    { name: 'ECG Analysis', path: '/cardiologist/ecg', icon: 'Activity' },
    { name: 'Reports', path: '/cardiologist/reports', icon: 'FileText' },
    { name: 'Prescriptions', path: '/cardiologist/prescriptions', icon: 'Pill' },
    { name: 'Analytics', path: '/cardiologist/analytics', icon: 'BarChart3' }
  ],
  nurse: [
    { name: 'Dashboard', path: '/nurse/dashboard', icon: 'LayoutDashboard' },
    { name: 'Patient Queue', path: '/nurse/queue', icon: 'Users' },
    { name: 'Vital Signs', path: '/nurse/vitals', icon: 'Activity' },
    { name: 'Care Plans', path: '/nurse/care-plans', icon: 'Clipboard' },
    { name: 'Medications', path: '/nurse/medications', icon: 'Pill' },
    { name: 'Notes', path: '/nurse/notes', icon: 'FileText' }
  ],
  admin: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
    { name: 'User Management', path: '/admin/users', icon: 'Users' },
    { name: 'System Settings', path: '/admin/settings', icon: 'Settings' },
    { name: 'Reports', path: '/admin/reports', icon: 'BarChart3' },
    { name: 'Audit Logs', path: '/admin/audit', icon: 'Shield' },
    { name: 'Backup', path: '/admin/backup', icon: 'Database' }
  ],
  receptionist: [
    { name: 'Dashboard', path: '/receptionist/dashboard', icon: 'LayoutDashboard' },
    { name: 'Appointments', path: '/receptionist/appointments', icon: 'Calendar' },
    { name: 'Patient Check-in', path: '/receptionist/checkin', icon: 'UserCheck' },
    { name: 'Waiting Queue', path: '/receptionist/queue', icon: 'Clock' },
    { name: 'Patient Records', path: '/receptionist/records', icon: 'FileText' },
    { name: 'Billing', path: '/receptionist/billing', icon: 'CreditCard' }
  ]
};

export const USER_ROLES = {
  PATIENT: 'patient',
  CARDIOLOGIST: 'cardiologist',
  NURSE: 'nurse',
  ADMIN: 'admin',
  RECEPTIONIST: 'receptionist'
};

export const APPOINTMENT_STATUSES = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked-in',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show'
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
};