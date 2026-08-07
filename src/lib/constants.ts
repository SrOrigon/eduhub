export type UserRole = "admin" | "director" | "teacher" | "student" | "parent";
export type AttendanceStatus = "present" | "absent" | "late" | "justified";
export type XpSource = "grade" | "attendance" | "mission" | "badge" | "manual" | "exercise";

export const USER_ROLES: UserRole[] = ["admin", "director", "teacher", "student", "parent"];
export const ATTENDANCE_STATUSES: AttendanceStatus[] = ["present", "absent", "late", "justified"];

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: "Presente",
  absent: "Falta",
  late: "Atraso",
  justified: "Justificada",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  director: "Diretor",
  teacher: "Professor",
  student: "Aluno",
  parent: "Responsável",
};

export const SUBJECTS = [
  "Matemática",
  "Português",
  "História",
  "Geografia",
  "Ciências",
  "Inglês",
  "Educação Física",
  "Artes",
];

export const PERIODS = ["1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"];

export function isKidFriendlyRole(role: UserRole) {
  return role === "student";
}
