-- AlterTable
ALTER TABLE "ChatBot" ADD COLUMN     "customLinksEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "popularTopics" TEXT,
ADD COLUMN     "popularTopicsEnabled" BOOLEAN NOT NULL DEFAULT true;
