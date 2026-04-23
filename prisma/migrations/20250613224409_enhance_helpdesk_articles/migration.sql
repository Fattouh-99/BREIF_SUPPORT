-- AlterTable
ALTER TABLE "HelpDesk" ADD COLUMN     "articleType" TEXT NOT NULL DEFAULT 'faq',
ADD COLUMN     "category" VARCHAR(100),
ADD COLUMN     "content" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "title" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "HelpDesk_articleType_idx" ON "HelpDesk"("articleType");

-- CreateIndex
CREATE INDEX "HelpDesk_category_idx" ON "HelpDesk"("category");

-- CreateIndex
CREATE INDEX "HelpDesk_isPublished_idx" ON "HelpDesk"("isPublished");

-- CreateIndex
CREATE INDEX "HelpDesk_isPinned_idx" ON "HelpDesk"("isPinned");
