import { prisma } from "@/lib/db";
import { SUBJECTS as DEFAULT_SUBJECTS, PERIODS as DEFAULT_PERIODS } from "@/lib/constants";

export type ExercisePreset = {
  label: string;
  xp: number;
  coins: number;
  points: number;
};

export type SchoolSettings = {
  xp: {
    perGradePoint: number;
    gradeBonusThreshold: number;
    gradeBonus: number;
    attendancePresent: number;
    attendanceLate: number;
    badgeUnlock: number;
    xpPerLevel: number;
  };
  missions: {
    defaultXp: number;
    defaultCoins: number;
  };
  exercises: {
    autoGradeEnabled: boolean;
    postGradeToBulletin: boolean;
    presets: ExercisePreset[];
  };
  academic: {
    subjects: string[];
    periods: string[];
    maxGrade: number;
    passGrade: number;
  };
  notifications: {
    parentsOnGrade: boolean;
    parentsOnAbsence: boolean;
    parentsOnMission: boolean;
    parentsOnShop: boolean;
    parentsOnExercise: boolean;
    parentsOnExerciseGraded: boolean;
    studentOnAbsence: boolean;
    teacherOnSubmission: boolean;
  };
  shop: {
    teachersCanFulfill: boolean;
    requireStock: boolean;
  };
};

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  xp: {
    perGradePoint: 5,
    gradeBonusThreshold: 9,
    gradeBonus: 50,
    attendancePresent: 10,
    attendanceLate: 5,
    badgeUnlock: 25,
    xpPerLevel: 300,
  },
  missions: {
    defaultXp: 100,
    defaultCoins: 30,
  },
  exercises: {
    autoGradeEnabled: true,
    postGradeToBulletin: true,
    presets: [
      { label: "Leve", xp: 50, coins: 15, points: 5 },
      { label: "Médio", xp: 80, coins: 25, points: 10 },
      { label: "Prova", xp: 150, coins: 40, points: 10 },
    ],
  },
  academic: {
    subjects: [...DEFAULT_SUBJECTS],
    periods: [...DEFAULT_PERIODS],
    maxGrade: 10,
    passGrade: 7,
  },
  notifications: {
    parentsOnGrade: true,
    parentsOnAbsence: true,
    parentsOnMission: true,
    parentsOnShop: true,
    parentsOnExercise: true,
    parentsOnExerciseGraded: true,
    studentOnAbsence: true,
    teacherOnSubmission: true,
  },
  shop: {
    teachersCanFulfill: true,
    requireStock: false,
  },
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge<T extends Record<string, unknown>>(base: T, patch: unknown): T {
  if (!isObject(patch)) return base;
  const out = { ...base };
  for (const key of Object.keys(base) as (keyof T)[]) {
    const b = base[key];
    const p = patch[key as string];
    if (Array.isArray(b)) {
      if (Array.isArray(p) && p.length > 0) {
        out[key] = p as T[keyof T];
      }
    } else if (isObject(b as Record<string, unknown>)) {
      out[key] = deepMerge(b as Record<string, unknown>, p) as T[keyof T];
    } else if (p !== undefined) {
      out[key] = p as T[keyof T];
    }
  }
  return out;
}

export function parseSchoolSettings(raw: string | null | undefined): SchoolSettings {
  if (!raw || raw === "{}") return structuredClone(DEFAULT_SCHOOL_SETTINGS);
  try {
    const parsed = JSON.parse(raw) as unknown;
    return deepMerge(
      structuredClone(DEFAULT_SCHOOL_SETTINGS) as unknown as Record<string, unknown>,
      parsed
    ) as unknown as SchoolSettings;
  } catch {
    return structuredClone(DEFAULT_SCHOOL_SETTINGS);
  }
}

export async function getSchoolSettings(schoolId: string | null | undefined): Promise<SchoolSettings> {
  if (!schoolId) return structuredClone(DEFAULT_SCHOOL_SETTINGS);
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { settings: true },
  });
  return parseSchoolSettings(school?.settings);
}

export async function getSchoolSettingsForStudent(studentId: string): Promise<SchoolSettings> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { user: { select: { schoolId: true } } },
  });
  return getSchoolSettings(student?.user.schoolId);
}

export function mergeSchoolSettings(
  current: SchoolSettings,
  patch: Partial<SchoolSettings>
): SchoolSettings {
  return deepMerge(
    structuredClone(current) as unknown as Record<string, unknown>,
    patch
  ) as unknown as SchoolSettings;
}

export function stringifySchoolSettings(settings: SchoolSettings): string {
  return JSON.stringify(settings);
}
