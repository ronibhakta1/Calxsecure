/*
  Warnings:

  - Made the column `userpin` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
UPDATE "User" SET "userpin" = '1234' WHERE "userpin" IS NULL;

ALTER TABLE "User" ALTER COLUMN "userpin" SET NOT NULL;
