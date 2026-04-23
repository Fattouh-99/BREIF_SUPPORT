/*
  Warnings:

  - You are about to drop the column `interactionMode` on the `ChatBot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatBot" DROP COLUMN "interactionMode",
ADD COLUMN     "chatbotEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "inquiryMode" BOOLEAN NOT NULL DEFAULT false;
