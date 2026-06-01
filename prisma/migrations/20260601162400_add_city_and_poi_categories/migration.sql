-- Add City support and POI categories for expanded Hai Phong after Hai Duong merger.
-- Safety policy: additive-only migration, no table rename, no column drop, no destructive data changes.

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "CityStatus" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PointOfInterestCategory" AS ENUM ('INDUSTRIAL_PARK', 'PORT', 'AIRPORT', 'UNIVERSITY', 'HOSPITAL', 'TRANSPORT', 'SHOPPING_MALL', 'TOURISM', 'RESIDENTIAL_AREA');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "cities" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "status" "CityStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),

  CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- AlterTable: nullable columns keep existing data valid.
ALTER TABLE "districts" ADD COLUMN IF NOT EXISTS "cityId" TEXT;
ALTER TABLE "points_of_interest" ADD COLUMN IF NOT EXISTS "cityId" TEXT;
ALTER TABLE "points_of_interest" ADD COLUMN IF NOT EXISTS "category" "PointOfInterestCategory" NOT NULL DEFAULT 'INDUSTRIAL_PARK';
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "cityId" TEXT;

-- CreateIndex / constraints.
CREATE UNIQUE INDEX IF NOT EXISTS "cities_name_key" ON "cities"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "cities_slug_key" ON "cities"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "cities_code_key" ON "cities"("code");
CREATE INDEX IF NOT EXISTS "cities_status_deletedAt_idx" ON "cities"("status", "deletedAt");
CREATE INDEX IF NOT EXISTS "districts_cityId_deletedAt_idx" ON "districts"("cityId", "deletedAt");
CREATE INDEX IF NOT EXISTS "points_of_interest_category_deletedAt_idx" ON "points_of_interest"("category", "deletedAt");
CREATE INDEX IF NOT EXISTS "points_of_interest_cityId_category_deletedAt_idx" ON "points_of_interest"("cityId", "category", "deletedAt");
CREATE INDEX IF NOT EXISTS "landing_pages_cityId_isPublished_deletedAt_idx" ON "landing_pages"("cityId", "isPublished", "deletedAt");
CREATE INDEX IF NOT EXISTS "landing_pages_districtId_isPublished_deletedAt_idx" ON "landing_pages"("districtId", "isPublished", "deletedAt");
CREATE INDEX IF NOT EXISTS "landing_pages_poiId_isPublished_deletedAt_idx" ON "landing_pages"("poiId", "isPublished", "deletedAt");

DO $$ BEGIN
  ALTER TABLE "districts" ADD CONSTRAINT "districts_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "points_of_interest" ADD CONSTRAINT "points_of_interest_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Seed data moved to prisma/seed.ts. Migrations remain schema-only and additive. 

