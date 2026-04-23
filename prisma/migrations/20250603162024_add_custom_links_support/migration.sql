-- AlterTable
ALTER TABLE "ChatBot" ADD COLUMN     "productsEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "CustomLink" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "url" VARCHAR(2048) NOT NULL,
    "chatBotId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomLink_chatBotId_idx" ON "CustomLink"("chatBotId");

-- AddForeignKey
ALTER TABLE "CustomLink" ADD CONSTRAINT "CustomLink_chatBotId_fkey" FOREIGN KEY ("chatBotId") REFERENCES "ChatBot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
