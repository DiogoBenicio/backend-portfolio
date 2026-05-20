-- CreateTable
CREATE TABLE "NpsResponse" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "name" TEXT,
    "page" TEXT NOT NULL DEFAULT 'portfolio',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NpsResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NpsResponse_page_idx" ON "NpsResponse"("page");

-- CreateIndex
CREATE INDEX "NpsResponse_score_idx" ON "NpsResponse"("score");

-- CreateIndex
CREATE INDEX "NpsResponse_createdAt_idx" ON "NpsResponse"("createdAt");
