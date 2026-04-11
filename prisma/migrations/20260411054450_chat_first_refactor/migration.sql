/*
  Warnings:

  - You are about to drop the `NowPage` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN "chatPrompt" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "NowPage";
PRAGMA foreign_keys=on;
