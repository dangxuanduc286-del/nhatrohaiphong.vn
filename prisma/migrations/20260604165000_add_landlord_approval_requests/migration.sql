-- CreateEnum
CREATE TYPE "LandlordApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "landlord_approval_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "LandlordApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "note" TEXT,
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landlord_approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "landlord_approval_requests_status_createdAt_idx" ON "landlord_approval_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX "landlord_approval_requests_userId_status_idx" ON "landlord_approval_requests"("userId", "status");

-- CreateIndex
CREATE INDEX "landlord_approval_requests_reviewedBy_idx" ON "landlord_approval_requests"("reviewedBy");

-- AddForeignKey
ALTER TABLE "landlord_approval_requests" ADD CONSTRAINT "landlord_approval_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landlord_approval_requests" ADD CONSTRAINT "landlord_approval_requests_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
