-- Additive system settings foundation for admin-managed configuration.
-- Safe for existing production data: creates a new enum, table, FK, and indexes only.
CREATE TYPE "SystemSettingCategory" AS ENUM ('GENERAL', 'SEO', 'LANDLORD', 'ANALYTICS');

CREATE TABLE "system_settings" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "description" TEXT,
  "category" "SystemSettingCategory" NOT NULL DEFAULT 'GENERAL',
  "updatedBy" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");
CREATE INDEX "system_settings_category_key_idx" ON "system_settings"("category", "key");
CREATE INDEX "system_settings_updatedBy_idx" ON "system_settings"("updatedBy");

ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
