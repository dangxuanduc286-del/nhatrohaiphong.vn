-- HOTFIX: Reconcile Phase 15-18 schema drift without data loss.
-- Safety: additive/idempotent only. No table drops, no truncates, no destructive data changes.

-- landlord_approval_requests: current DB came from an older duplicate migration
-- with reason/submittedAt but without note/rejectionReason expected by Prisma.
ALTER TABLE "landlord_approval_requests"
  ADD COLUMN IF NOT EXISTS "note" TEXT;

ALTER TABLE "landlord_approval_requests"
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

CREATE INDEX IF NOT EXISTS "landlord_approval_requests_status_createdAt_idx"
  ON "landlord_approval_requests"("status", "createdAt");

CREATE INDEX IF NOT EXISTS "landlord_approval_requests_reviewedBy_idx"
  ON "landlord_approval_requests"("reviewedBy");

-- system_settings: current DB has legacy group-based table shape.
-- Add the Prisma schema columns while preserving existing rows and legacy column.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SystemSettingCategory') THEN
    CREATE TYPE "SystemSettingCategory" AS ENUM ('GENERAL', 'SEO', 'LANDLORD', 'ANALYTICS');
  END IF;
END $$;

ALTER TABLE "system_settings"
  ADD COLUMN IF NOT EXISTS "description" TEXT;

ALTER TABLE "system_settings"
  ADD COLUMN IF NOT EXISTS "category" "SystemSettingCategory" NOT NULL DEFAULT 'GENERAL';

ALTER TABLE "system_settings"
  ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

CREATE INDEX IF NOT EXISTS "system_settings_category_key_idx"
  ON "system_settings"("category", "key");

CREATE INDEX IF NOT EXISTS "system_settings_updatedBy_idx"
  ON "system_settings"("updatedBy");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'system_settings_updatedBy_fkey'
  ) THEN
    ALTER TABLE "system_settings"
      ADD CONSTRAINT "system_settings_updatedBy_fkey"
      FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Legacy migration created value as JSONB; Prisma schema and admin settings code use String/TEXT.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'system_settings'
      AND column_name = 'value'
      AND data_type = 'jsonb'
  ) THEN
    ALTER TABLE "system_settings"
      ALTER COLUMN "value" TYPE TEXT
      USING CASE
        WHEN jsonb_typeof("value") = 'string' THEN trim(both '"' from "value"::text)
        ELSE "value"::text
      END;
  END IF;
END $$;
