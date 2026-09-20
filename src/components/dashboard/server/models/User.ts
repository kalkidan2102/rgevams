export interface IUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "official" | "researcher" | "guest" | "superadmin";
  status: "approved" | "pending" | "rejected";
  institution: string;
  password?: string;
  registeredAt: string;
  approvedAt?: string;
  approvedBy?: string;
  failedLoginAttempts?: number;
  isLocked?: boolean;
  lockUntil?: string;
}

export const defaultUsers: IUser[] = [
  {
    id: "admin@essgi.gov.et",
    name: "Dr. Solomon Tadesse (Administrator)",
    email: "admin@essgi.gov.et",
    role: "admin",
    status: "approved",
    institution: "ESSGI Directorate of Geodesy & Geodynamics",
    password: "Admin@2026!",
    registeredAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "Director General",
    failedLoginAttempts: 0,
    isLocked: false
  },
  {
    id: "staff.duty@essgi.gov.et",
    name: "Kalkidan Getachew (Staff Duty Officer)",
    email: "staff.duty@essgi.gov.et",
    role: "official",
    status: "approved",
    institution: "ESSGI 24/7 Geohazard Emergency Operations Room",
    password: "Staff@2026!",
    registeredAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "Dr. Solomon Tadesse",
    failedLoginAttempts: 0,
    isLocked: false
  },
  {
    id: "researcher@essgi.gov.et",
    name: "Prof. Dawit Alemu (Lead Researcher)",
    email: "researcher@essgi.gov.et",
    role: "researcher",
    status: "approved",
    institution: "ESSGI & COMET Rift Geodynamics Lab",
    password: "Research@2026!",
    registeredAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "Dr. Solomon Tadesse",
    failedLoginAttempts: 0,
    isLocked: false
  },
  {
    id: "kalgetachew764@gmail.com",
    name: "Kalkidan Getachew",
    email: "kalgetachew764@gmail.com",
    role: "official",
    status: "approved",
    institution: "Ethiopian Space Science and Geospatial Institute (ESSGI)",
    password: "Staff@2026!",
    registeredAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: "Dr. Solomon Tadesse",
    failedLoginAttempts: 0,
    isLocked: false
  },
  {
    id: "pending.official@essgi.gov.et",
    name: "Dr. Abera Teklu",
    email: "pending.official@essgi.gov.et",
    role: "official",
    status: "pending",
    institution: "Semera University Seismology Lab",
    password: "Semera@2026!",
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    failedLoginAttempts: 0,
    isLocked: false
  },
  {
    id: "visitor@essgi.gov.et",
    name: "Guest Geophysicist",
    email: "visitor@essgi.gov.et",
    role: "guest",
    status: "approved",
    institution: "Geospatial Institute (Visitor)",
    password: "Guest@2026!",
    registeredAt: new Date().toISOString(),
    failedLoginAttempts: 0,
    isLocked: false
  }
];


