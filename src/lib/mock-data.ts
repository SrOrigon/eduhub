import type {
  Attendance,
  Badge,
  ClassGroup,
  DashboardStats,
  Grade,
  Mission,
  Profile,
  School,
  Student,
  XpTransaction,
} from "@/types/database";

export const demoSchool: School = {
  id: "school-1",
  name: "Escola Municipal Demo",
  slug: "escola-demo",
  city: "São Paulo",
  state: "SP",
  created_at: "2026-01-15T10:00:00Z",
};

export const demoProfiles: Profile[] = [
  {
    id: "user-admin",
    email: "admin@eduhub.local",
    full_name: "Ana Diretora",
    role: "director",
    school_id: "school-1",
    created_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "user-teacher",
    email: "professor@eduhub.local",
    full_name: "Carlos Professor",
    role: "teacher",
    school_id: "school-1",
    created_at: "2026-01-15T10:00:00Z",
  },
];

export const demoClasses: ClassGroup[] = [
  {
    id: "class-1",
    school_id: "school-1",
    name: "8º Ano A",
    grade_level: "8",
    year: 2026,
    teacher_id: "user-teacher",
    created_at: "2026-02-01T08:00:00Z",
  },
  {
    id: "class-2",
    school_id: "school-1",
    name: "9º Ano B",
    grade_level: "9",
    year: 2026,
    teacher_id: "user-teacher",
    created_at: "2026-02-01T08:00:00Z",
  },
];

export const demoStudents: Student[] = [
  {
    id: "student-1",
    profile_id: "profile-1",
    enrollment_code: "2026001",
    class_id: "class-1",
    xp_total: 2450,
    level: 8,
    coins: 320,
    created_at: "2026-02-05T08:00:00Z",
    profile: {
      id: "profile-1",
      email: "lucas@aluno.local",
      full_name: "Lucas Henrique",
      role: "student",
      school_id: "school-1",
      created_at: "2026-02-05T08:00:00Z",
    },
  },
  {
    id: "student-2",
    profile_id: "profile-2",
    enrollment_code: "2026002",
    class_id: "class-1",
    xp_total: 1980,
    level: 6,
    coins: 210,
    created_at: "2026-02-05T08:00:00Z",
    profile: {
      id: "profile-2",
      email: "ana@aluno.local",
      full_name: "Ana Beatriz",
      role: "student",
      school_id: "school-1",
      created_at: "2026-02-05T08:00:00Z",
    },
  },
  {
    id: "student-3",
    profile_id: "profile-3",
    enrollment_code: "2026003",
    class_id: "class-2",
    xp_total: 3120,
    level: 10,
    coins: 450,
    created_at: "2026-02-05T08:00:00Z",
    profile: {
      id: "profile-3",
      email: "maria@aluno.local",
      full_name: "Maria Eduarda",
      role: "student",
      school_id: "school-1",
      created_at: "2026-02-05T08:00:00Z",
    },
  },
  {
    id: "student-4",
    profile_id: "profile-4",
    enrollment_code: "2026004",
    class_id: "class-2",
    xp_total: 890,
    level: 3,
    coins: 95,
    created_at: "2026-02-05T08:00:00Z",
    profile: {
      id: "profile-4",
      email: "pedro@aluno.local",
      full_name: "Pedro Santos",
      role: "student",
      school_id: "school-1",
      created_at: "2026-02-05T08:00:00Z",
    },
  },
];

export const demoGrades: Grade[] = [
  { id: "g1", student_id: "student-1", subject: "Matemática", value: 8.5, max_value: 10, period: "1º Bimestre", created_at: "2026-03-10T10:00:00Z" },
  { id: "g2", student_id: "student-1", subject: "Português", value: 7.0, max_value: 10, period: "1º Bimestre", created_at: "2026-03-10T10:00:00Z" },
  { id: "g3", student_id: "student-2", subject: "Matemática", value: 9.0, max_value: 10, period: "1º Bimestre", created_at: "2026-03-10T10:00:00Z" },
  { id: "g4", student_id: "student-2", subject: "Português", value: 8.5, max_value: 10, period: "1º Bimestre", created_at: "2026-03-10T10:00:00Z" },
  { id: "g5", student_id: "student-3", subject: "Matemática", value: 9.5, max_value: 10, period: "1º Bimestre", created_at: "2026-03-10T10:00:00Z" },
  { id: "g6", student_id: "student-4", subject: "Matemática", value: 5.5, max_value: 10, period: "1º Bimestre", created_at: "2026-03-10T10:00:00Z" },
];

export const demoMissions: Mission[] = [
  {
    id: "m1",
    school_id: "school-1",
    class_id: "class-1",
    title: "Quiz de Frações",
    description: "Complete o quiz sobre frações e equações simples.",
    xp_reward: 150,
    coin_reward: 50,
    due_date: "2026-08-15",
    is_active: true,
    created_at: "2026-08-01T08:00:00Z",
  },
  {
    id: "m2",
    school_id: "school-1",
    title: "Leitura Semanal",
    description: "Leia 20 páginas e responda 5 perguntas.",
    xp_reward: 100,
    coin_reward: 30,
    due_date: "2026-08-20",
    is_active: true,
    created_at: "2026-08-01T08:00:00Z",
  },
];

export const demoBadges: Badge[] = [
  { id: "b1", school_id: "school-1", name: "Pontualidade", description: "30 dias sem faltas", icon: "clock", xp_required: 500, created_at: "2026-01-15T10:00:00Z" },
  { id: "b2", school_id: "school-1", name: "Estudante Estrela", description: "Média acima de 9.0", icon: "star", xp_required: 1000, created_at: "2026-01-15T10:00:00Z" },
  { id: "b3", school_id: "school-1", name: "Missão Completa", description: "5 missões concluídas", icon: "target", xp_required: 750, created_at: "2026-01-15T10:00:00Z" },
];

export const monthlyPerformance = [
  { month: "Mar", nota: 7.2, xp: 420, frequencia: 92 },
  { month: "Abr", nota: 7.5, xp: 580, frequencia: 94 },
  { month: "Mai", nota: 7.8, xp: 720, frequencia: 91 },
  { month: "Jun", nota: 8.1, xp: 890, frequencia: 95 },
  { month: "Jul", nota: 8.0, xp: 650, frequencia: 88 },
  { month: "Ago", nota: 8.3, xp: 980, frequencia: 96 },
];

export const classComparison = [
  { turma: "8º A", media: 8.1, engajamento: 85 },
  { turma: "9º B", media: 7.4, engajamento: 72 },
];

export const demoStats: DashboardStats = {
  totalStudents: demoStudents.length,
  totalClasses: demoClasses.length,
  averageGrade: 7.8,
  attendanceRate: 93,
  activeMissions: demoMissions.filter((m) => m.is_active).length,
  totalXpAwarded: demoStudents.reduce((sum, s) => sum + s.xp_total, 0),
};

export function getRanking() {
  return [...demoStudents]
    .sort((a, b) => b.xp_total - a.xp_total)
    .map((student, index) => ({
      rank: index + 1,
      name: student.profile?.full_name ?? "Aluno",
      xp: student.xp_total,
      level: student.level,
      className: demoClasses.find((c) => c.id === student.class_id)?.name ?? "-",
    }));
}

export function getStudentGrades(studentId: string) {
  return demoGrades.filter((g) => g.student_id === studentId);
}

export function getClassStudents(classId: string) {
  return demoStudents.filter((s) => s.class_id === classId);
}

export const demoAttendance: Attendance[] = [
  { id: "a1", student_id: "student-1", class_id: "class-1", date: "2026-08-04", status: "present", created_at: "2026-08-04T08:00:00Z" },
  { id: "a2", student_id: "student-2", class_id: "class-1", date: "2026-08-04", status: "present", created_at: "2026-08-04T08:00:00Z" },
  { id: "a3", student_id: "student-3", class_id: "class-2", date: "2026-08-04", status: "late", created_at: "2026-08-04T08:00:00Z" },
  { id: "a4", student_id: "student-4", class_id: "class-2", date: "2026-08-04", status: "absent", created_at: "2026-08-04T08:00:00Z" },
];

export const demoXpTransactions: XpTransaction[] = [
  { id: "xp1", student_id: "student-1", amount: 150, reason: "Missão: Quiz de Frações", source: "mission", created_at: "2026-08-05T10:00:00Z" },
  { id: "xp2", student_id: "student-1", amount: 50, reason: "Presença semanal", source: "attendance", created_at: "2026-08-04T08:00:00Z" },
  { id: "xp3", student_id: "student-3", amount: 200, reason: "Nota acima de 9.0", source: "grade", created_at: "2026-08-03T14:00:00Z" },
];
