/*
  Warnings:

  - You are about to drop the column `chatMode` on the `ChatBot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatBot" DROP COLUMN "chatMode",
ADD COLUMN     "interactionMode" TEXT DEFAULT 'CHATBOT';

-- DropEnum
DROP TYPE "ChatMode";
