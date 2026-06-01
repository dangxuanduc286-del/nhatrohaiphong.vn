-- Monetization + subscription production schema
-- Safe additive migration: keeps existing search/listing/admin/RBAC contracts intact.

ALTER TYPE "PlanCode" ADD VALUE IF NOT EXISTS 'BASIC';
ALTER TYPE "PlanCode" ADD VALUE IF NOT EXISTS 'FEATURED';
ALTER TYPE "PlanCode" ADD VALUE IF NOT EXISTS 'VIP';
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'CREDIT_TOPUP';
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'CREDIT_USAGE';
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'CREDIT_REFUND';
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'SUBSCRIPTION_PURCHASE';
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'ROOM_BOOST_PURCHASE';

CREATE TYPE IF NOT EXISTS "RoomBoostType" AS ENUM ('PUSH', 'FEATURED', 'VIP');
CREATE TYPE IF NOT EXISTS "RoomBoostStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED');
CREATE TYPE IF NOT EXISTS "WalletTransactionType" AS ENUM ('TOPUP', 'SPEND', 'REFUND', 'ADJUSTMENT');
CREATE TYPE IF NOT EXISTS "WalletTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE IF NOT EXISTS "BillingRecordType" AS ENUM ('SUBSCRIPTION', 'ROOM_BOOST', 'WALLET_TOPUP', 'REFUND', 'ADJUSTMENT');
CREATE TYPE IF NOT EXISTS "BillingRecordStatus" AS ENUM ('DRAFT', 'PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED');
CREATE TYPE IF NOT EXISTS "PaymentIntentStatus" AS ENUM ('CREATED', 'PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED');

ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "listingLimit" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "benefits" JSONB;

ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'PENDING';
ALTER TABLE "subscriptions" ALTER COLUMN "startsAt" DROP NOT NULL;
ALTER TABLE "subscriptions" ALTER COLUMN "endsAt" DROP NOT NULL;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

CREATE TABLE IF NOT EXISTS "room_boosts" (
  "id" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "planId" TEXT,
  "type" "RoomBoostType" NOT NULL,
  "status" "RoomBoostStatus" NOT NULL DEFAULT 'PENDING',
  "priority" INTEGER NOT NULL DEFAULT 0,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "room_boosts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "room_boosts_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "room_boosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "room_boosts_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "wallets" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "balance" INTEGER NOT NULL DEFAULT 0,
  "lockedBalance" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "wallets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "wallets_userId_key" UNIQUE ("userId"),
  CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "wallets_non_negative_balance" CHECK ("balance" >= 0 AND "lockedBalance" >= 0)
);

CREATE TABLE IF NOT EXISTS "wallet_transactions" (
  "id" TEXT NOT NULL,
  "walletId" TEXT NOT NULL,
  "type" "WalletTransactionType" NOT NULL,
  "status" "WalletTransactionStatus" NOT NULL DEFAULT 'PENDING',
  "amount" INTEGER NOT NULL,
  "balanceAfter" INTEGER,
  "referenceType" TEXT,
  "referenceId" TEXT,
  "idempotencyKey" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "wallet_transactions_idempotencyKey_key" UNIQUE ("idempotencyKey"),
  CONSTRAINT "wallet_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "payment_intents" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "paymentId" TEXT,
  "provider" "PaymentProvider" NOT NULL,
  "status" "PaymentIntentStatus" NOT NULL DEFAULT 'CREATED',
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'VND',
  "externalId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "callbackVerifiedAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payment_intents_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payment_intents_externalId_key" UNIQUE ("externalId"),
  CONSTRAINT "payment_intents_idempotencyKey_key" UNIQUE ("idempotencyKey"),
  CONSTRAINT "payment_intents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "payment_intents_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "billing_records" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "subscriptionId" TEXT,
  "roomBoostId" TEXT,
  "type" "BillingRecordType" NOT NULL,
  "status" "BillingRecordStatus" NOT NULL DEFAULT 'PENDING',
  "amount" DECIMAL(12,2) NOT NULL,
  "paidAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "billing_records_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "billing_records_code_key" UNIQUE ("code"),
  CONSTRAINT "billing_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "billing_records_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "billing_records_roomBoostId_fkey" FOREIGN KEY ("roomBoostId") REFERENCES "room_boosts"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "plans_isActive_displayOrder_deletedAt_idx" ON "plans"("isActive", "displayOrder", "deletedAt");
CREATE INDEX IF NOT EXISTS "subscriptions_userId_status_deletedAt_idx" ON "subscriptions"("userId", "status", "deletedAt");
CREATE INDEX IF NOT EXISTS "room_boosts_roomId_status_startsAt_endsAt_idx" ON "room_boosts"("roomId", "status", "startsAt", "endsAt");
CREATE INDEX IF NOT EXISTS "room_boosts_type_status_priority_idx" ON "room_boosts"("type", "status", "priority");
CREATE INDEX IF NOT EXISTS "wallets_balance_idx" ON "wallets"("balance");
CREATE INDEX IF NOT EXISTS "wallet_transactions_walletId_createdAt_idx" ON "wallet_transactions"("walletId", "createdAt");
CREATE INDEX IF NOT EXISTS "wallet_transactions_referenceType_referenceId_idx" ON "wallet_transactions"("referenceType", "referenceId");
CREATE INDEX IF NOT EXISTS "payment_intents_provider_status_createdAt_idx" ON "payment_intents"("provider", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "payment_intents_userId_status_idx" ON "payment_intents"("userId", "status");
CREATE INDEX IF NOT EXISTS "billing_records_userId_status_createdAt_idx" ON "billing_records"("userId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "billing_records_type_status_createdAt_idx" ON "billing_records"("type", "status", "createdAt");

INSERT INTO "plans" ("id", "code", "name", "description", "price", "durationDays", "listingLimit", "displayOrder", "features", "benefits", "isActive", "createdAt", "updatedAt") VALUES
  ('plan_free', 'FREE', 'Gói miễn phí', 'Gói khởi đầu cho chủ trọ mới.', 0, 30, 1, 10, '{"support":"basic"}', '{"display":"standard","boost":"none"}', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plan_basic', 'BASIC', 'Gói cơ bản', 'Tăng giới hạn đăng tin cơ bản.', 99000, 30, 5, 20, '{"support":"email"}', '{"display":"standard","boost":"push"}', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plan_featured', 'FEATURED', 'Gói nổi bật', 'Tin nổi bật cho chủ trọ cần tăng hiển thị.', 199000, 30, 15, 30, '{"support":"priority"}', '{"display":"featured","boost":"featured"}', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('plan_vip', 'VIP', 'Gói VIP', 'Ưu tiên hiển thị cao nhất.', 399000, 30, 50, 40, '{"support":"priority","accountManager":true}', '{"display":"vip","boost":"vip"}', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "price" = EXCLUDED."price",
  "durationDays" = EXCLUDED."durationDays",
  "listingLimit" = EXCLUDED."listingLimit",
  "displayOrder" = EXCLUDED."displayOrder",
  "features" = EXCLUDED."features",
  "benefits" = EXCLUDED."benefits",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = CURRENT_TIMESTAMP;
