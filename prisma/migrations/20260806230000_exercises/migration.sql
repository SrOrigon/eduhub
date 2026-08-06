-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "classId" TEXT,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'homework',
    "maxPoints" REAL NOT NULL DEFAULT 10,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "coinReward" INTEGER NOT NULL DEFAULT 0,
    "dueDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Exercise_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Exercise_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Exercise_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ExerciseQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exerciseId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'choice',
    "options" TEXT,
    "points" REAL NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ExerciseQuestion_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ExerciseSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exerciseId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "score" REAL,
    "maxScore" REAL,
    "feedback" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt" DATETIME,
    "gradedById" TEXT,
    CONSTRAINT "ExerciseSubmission_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExerciseSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExerciseSubmission_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "ExerciseAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "textAnswer" TEXT,
    "selectedOptionId" TEXT,
    "pointsAwarded" REAL,
    "isCorrect" BOOLEAN,
    CONSTRAINT "ExerciseAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ExerciseSubmission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExerciseAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ExerciseQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Exercise_schoolId_idx" ON "Exercise"("schoolId");
CREATE INDEX "Exercise_classId_idx" ON "Exercise"("classId");
CREATE INDEX "Exercise_teacherId_idx" ON "Exercise"("teacherId");
CREATE INDEX "ExerciseQuestion_exerciseId_idx" ON "ExerciseQuestion"("exerciseId");
CREATE UNIQUE INDEX "ExerciseSubmission_exerciseId_studentId_key" ON "ExerciseSubmission"("exerciseId", "studentId");
CREATE INDEX "ExerciseSubmission_exerciseId_idx" ON "ExerciseSubmission"("exerciseId");
CREATE INDEX "ExerciseSubmission_studentId_idx" ON "ExerciseSubmission"("studentId");
CREATE UNIQUE INDEX "ExerciseAnswer_submissionId_questionId_key" ON "ExerciseAnswer"("submissionId", "questionId");
