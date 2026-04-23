-- CreateEnum
CREATE TYPE "ChatMode" AS ENUM ('FULL_CHATBOT', 'INQUIRY_ONLY');

-- AlterTable
ALTER TABLE "ChatBot" ADD COLUMN     "chatMode" "ChatMode" NOT NULL DEFAULT 'FULL_CHATBOT';
