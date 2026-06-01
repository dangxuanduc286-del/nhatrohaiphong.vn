import type { PaymentProvider, PlanCode, RoomBoostType } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

export const monetizationPlanCodes: PlanCode[] = ["FREE", "BASIC", "FEATURED", "VIP"];

export type MonetizationPlanBenefits = {
  display?: "standard" | "featured" | "vip";
  boost?: "none" | "push" | "featured" | "vip";
};

export type PaymentProviderAdapter = {
  provider: PaymentProvider;
  createIntent(input: { userId: string; amount: Prisma.Decimal | number | string; idempotencyKey: string; metadata?: Prisma.InputJsonValue }): Promise<{ externalId?: string; redirectUrl?: string; raw?: Prisma.InputJsonValue }>;
  verifyCallback(input: { payload: unknown; signature?: string }): Promise<{ externalId: string; success: boolean; amount?: string; raw?: Prisma.InputJsonValue }>;
};

const unavailableProvider = (provider: PaymentProvider): PaymentProviderAdapter => ({
  provider,
  async createIntent() {
    throw new AppError(`${provider} provider is not configured`, 503, "PAYMENT_PROVIDER_NOT_CONFIGURED");
  },
  async verifyCallback() {
    throw new AppError(`${provider} callback verification is not configured`, 503, "PAYMENT_PROVIDER_NOT_CONFIGURED");
  },
});

export const paymentProviders: Record<PaymentProvider, PaymentProviderAdapter> = {
  CASH: unavailableProvider("CASH"),
  BANK_TRANSFER: unavailableProvider("BANK_TRANSFER"),
  VNPAY: unavailableProvider("VNPAY"),
  MOMO: unavailableProvider("MOMO"),
  ZALOPAY: unavailableProvider("ZALOPAY"),
};

export async function getActivePlans() {
  return db.plan.findMany({
    where: { isActive: true, deletedAt: null, code: { in: monetizationPlanCodes } },
    orderBy: [{ displayOrder: "asc" }, { price: "asc" }],
  });
}

export async function createSubscriptionPurchase(input: { userId: string; planId: string; idempotencyKey: string }) {
  return db.$transaction(async (tx) => {
    const plan = await tx.plan.findFirst({ where: { id: input.planId, isActive: true, deletedAt: null } });
    if (!plan) throw new AppError("Plan not found", 404, "PLAN_NOT_FOUND");

    const existing = await tx.billingRecord.findFirst({ where: { code: input.idempotencyKey } });
    if (existing) return existing;

    const subscription = await tx.subscription.create({
      data: { userId: input.userId, planId: plan.id, status: "PENDING", metadata: { source: "subscription_purchase" } },
    });

    return tx.billingRecord.create({
      data: {
        code: input.idempotencyKey,
        userId: input.userId,
        subscriptionId: subscription.id,
        type: "SUBSCRIPTION",
        status: plan.price.toString() === "0" ? "PAID" : "PENDING",
        amount: plan.price,
        paidAt: plan.price.toString() === "0" ? new Date() : null,
        metadata: { planCode: plan.code },
      },
    });
  });
}

export async function ensureWallet(userId: string) {
  return db.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function creditWallet(input: { userId: string; amount: number; type: "TOPUP" | "REFUND" | "ADJUSTMENT"; idempotencyKey: string; referenceType?: string; referenceId?: string }) {
  if (!Number.isInteger(input.amount) || input.amount <= 0) throw new AppError("Credit amount must be positive", 400, "INVALID_WALLET_AMOUNT");

  return db.$transaction(async (tx) => {
    const existing = await tx.walletTransaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return existing;

    const wallet = await tx.wallet.upsert({ where: { userId: input.userId }, update: {}, create: { userId: input.userId } });
    const nextBalance = wallet.balance + input.amount;
    await tx.wallet.update({ where: { id: wallet.id }, data: { balance: nextBalance } });
    return tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: input.type,
        status: "COMPLETED",
        amount: input.amount,
        balanceAfter: nextBalance,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        idempotencyKey: input.idempotencyKey,
      },
    });
  });
}

export async function spendWallet(input: { userId: string; amount: number; idempotencyKey: string; referenceType?: string; referenceId?: string }) {
  if (!Number.isInteger(input.amount) || input.amount <= 0) throw new AppError("Spend amount must be positive", 400, "INVALID_WALLET_AMOUNT");

  return db.$transaction(async (tx) => {
    const existing = await tx.walletTransaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return existing;

    const wallet = await tx.wallet.upsert({ where: { userId: input.userId }, update: {}, create: { userId: input.userId } });
    if (wallet.balance < input.amount) throw new AppError("Insufficient wallet balance", 400, "INSUFFICIENT_WALLET_BALANCE");

    const nextBalance = wallet.balance - input.amount;
    await tx.wallet.update({ where: { id: wallet.id }, data: { balance: nextBalance } });
    return tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "SPEND",
        status: "COMPLETED",
        amount: -input.amount,
        balanceAfter: nextBalance,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        idempotencyKey: input.idempotencyKey,
      },
    });
  });
}

export async function createRoomBoost(input: { userId: string; roomId: string; type: RoomBoostType; priority: number; startsAt: Date; endsAt: Date; idempotencyKey: string; price: number }) {
  return db.$transaction(async (tx) => {
    const room = await tx.room.findFirst({ where: { id: input.roomId, deletedAt: null }, select: { id: true, createdBy: true } });
    if (!room) throw new AppError("Room not found", 404, "ROOM_NOT_FOUND");
    if (room.createdBy && room.createdBy !== input.userId) throw new AppError("Unauthorized room boost", 403, "UNAUTHORIZED_ROOM_BOOST");

    const existing = await tx.billingRecord.findFirst({ where: { code: input.idempotencyKey } });
    if (existing) return existing;

    const boost = await tx.roomBoost.create({
      data: { roomId: input.roomId, userId: input.userId, type: input.type, priority: input.priority, status: "ACTIVE", startsAt: input.startsAt, endsAt: input.endsAt },
    });

    return tx.billingRecord.create({
      data: { code: input.idempotencyKey, userId: input.userId, roomBoostId: boost.id, type: "ROOM_BOOST", status: "PENDING", amount: input.price, metadata: { boostType: input.type } },
    });
  });
}

export function roomBoostRankingOrder(now = new Date()) {
  return {
    boosts: {
      where: { status: "ACTIVE" as const, deletedAt: null, OR: [{ startsAt: null }, { startsAt: { lte: now } }], AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] },
      orderBy: [{ priority: "desc" as const }, { createdAt: "desc" as const }],
      take: 1,
    },
  };
}
