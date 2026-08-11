-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "ProblemDifficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "TestCaseVisibility" AS ENUM ('visible', 'hidden');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('pending', 'accepted', 'wrong_answer', 'runtime_error', 'compilation_error', 'time_limit_exceeded', 'memory_limit_exceeded', 'internal_error');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(20) NOT NULL,
    "last_name" VARCHAR(20),
    "email_id" VARCHAR(320) NOT NULL,
    "age" INTEGER,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problems" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "ProblemDifficulty" NOT NULL,
    "problem_creator_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_tags" (
    "problem_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "problem_tags_pkey" PRIMARY KEY ("problem_id","tag_id")
);

-- CreateTable
CREATE TABLE "problem_test_cases" (
    "id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "visibility" "TestCaseVisibility" NOT NULL,
    "position" INTEGER NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "problem_test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_reference_solutions" (
    "id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "language" VARCHAR(32) NOT NULL,
    "complete_code" TEXT NOT NULL,

    CONSTRAINT "problem_reference_solutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_starter_code" (
    "id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "language" VARCHAR(32) NOT NULL,
    "initial_code" TEXT NOT NULL,

    CONSTRAINT "problem_starter_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_solved_problems" (
    "user_id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,

    CONSTRAINT "user_solved_problems_pkey" PRIMARY KEY ("user_id","problem_id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "problem_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "language" VARCHAR(32) NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'pending',
    "runtime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "memory" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "error_message" TEXT DEFAULT '',
    "test_cases_passed" INTEGER NOT NULL DEFAULT 0,
    "test_cases_total" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_id_key" ON "users"("email_id");

-- CreateIndex
CREATE INDEX "problems_problem_creator_id_idx" ON "problems"("problem_creator_id");

-- CreateIndex
CREATE INDEX "problems_title_idx" ON "problems"("title");

-- CreateIndex
CREATE INDEX "problems_difficulty_idx" ON "problems"("difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "problem_tags_tag_id_problem_id_idx" ON "problem_tags"("tag_id", "problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "problem_test_cases_problem_id_visibility_position_key" ON "problem_test_cases"("problem_id", "visibility", "position");

-- CreateIndex
CREATE UNIQUE INDEX "problem_reference_solutions_problem_id_position_key" ON "problem_reference_solutions"("problem_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "problem_starter_code_problem_id_position_key" ON "problem_starter_code"("problem_id", "position");

-- CreateIndex
CREATE INDEX "user_solved_problems_problem_id_user_id_idx" ON "user_solved_problems"("problem_id", "user_id");

-- CreateIndex
CREATE INDEX "submissions_user_id_problem_id_idx" ON "submissions"("user_id", "problem_id");

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_problem_creator_id_fkey" FOREIGN KEY ("problem_creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_tags" ADD CONSTRAINT "problem_tags_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_tags" ADD CONSTRAINT "problem_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_test_cases" ADD CONSTRAINT "problem_test_cases_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_reference_solutions" ADD CONSTRAINT "problem_reference_solutions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_starter_code" ADD CONSTRAINT "problem_starter_code_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_solved_problems" ADD CONSTRAINT "user_solved_problems_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_solved_problems" ADD CONSTRAINT "user_solved_problems_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
