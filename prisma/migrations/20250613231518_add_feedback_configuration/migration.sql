-- AlterTable
ALTER TABLE "ChatBot" ADD COLUMN     "feedbackEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "feedbackFollowUp" TEXT NOT NULL DEFAULT 'Still need help? Start a conversation',
ADD COLUMN     "feedbackNoText" TEXT NOT NULL DEFAULT '👎 No',
ADD COLUMN     "feedbackQuestion" TEXT NOT NULL DEFAULT 'Was this helpful?',
ADD COLUMN     "feedbackYesText" TEXT NOT NULL DEFAULT '👍 Yes';
