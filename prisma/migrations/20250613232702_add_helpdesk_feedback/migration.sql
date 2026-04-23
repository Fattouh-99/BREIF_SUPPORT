-- CreateTable
CREATE TABLE "HelpDeskFeedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "helpDeskId" UUID NOT NULL,
    "domainId" UUID NOT NULL,
    "isHelpful" BOOLEAN NOT NULL,
    "sessionId" VARCHAR(255),
    "userAgent" TEXT,
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpDeskFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HelpDeskFeedback_helpDeskId_idx" ON "HelpDeskFeedback"("helpDeskId");

-- CreateIndex
CREATE INDEX "HelpDeskFeedback_domainId_idx" ON "HelpDeskFeedback"("domainId");

-- CreateIndex
CREATE INDEX "HelpDeskFeedback_sessionId_idx" ON "HelpDeskFeedback"("sessionId");

-- CreateIndex
CREATE INDEX "HelpDeskFeedback_createdAt_idx" ON "HelpDeskFeedback"("createdAt");

-- AddForeignKey
ALTER TABLE "HelpDeskFeedback" ADD CONSTRAINT "HelpDeskFeedback_helpDeskId_fkey" FOREIGN KEY ("helpDeskId") REFERENCES "HelpDesk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpDeskFeedback" ADD CONSTRAINT "HelpDeskFeedback_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
