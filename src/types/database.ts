export type UserRole = "admin" | "director" | "teacher" | "student" | "parent";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  school_id?: string;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  slug: string;
  city?: string;
  state?: string;
  created_at: string;
}

export interface ClassGroup {
  id: string;
  school_id: string;
  name: string;
  grade_level: string;
  year: number;
  teacher_id?: string;
  created_at: string;
}

export interface Student {
  id: string;
  profile_id: string;
  enrollment_code: string;
  birth_date?: string;
  class_id?: string;
  xp_total: number;
  level: number;
  coins: number;
  created_at: string;
  profile?: Profile;
  class_group?: ClassGroup;
}

export interface Grade {
  id: string;
  student_id: string;
  subject: string;
  value: number;
  max_value: number;
  period: string;
  teacher_id?: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: "present" | "absent" | "late" | "justified";
  created_at: string;
}

export interface Mission {
  id: string;
  school_id: string;
  class_id?: string;
  title: string;
  description: string;
  xp_reward: number;
  coin_reward: number;
  due_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface Badge {
  id: string;
  school_id: string;
  name: string;
  description: string;
  icon: string;
  xp_required: number;
  created_at: string;
}

export interface XpTransaction {
  id: string;
  student_id: string;
  amount: number;
  reason: string;
  source: "grade" | "attendance" | "mission" | "badge" | "manual";
  created_at: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  averageGrade: number;
  attendanceRate: number;
  activeMissions: number;
  totalXpAwarded: number;
}
