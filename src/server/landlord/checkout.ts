import { z } from "zod";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { PaymentProvider, RoomBoostType } from "@/generated/prisma/enums";
import { createRoomBoost, createSubscriptionPurchase, ensureWallet } from "@/server/monetization/service";

const checkoutIntentSchema = z.object({
  type: z.enum(["plan", "renew", "boost", "wallet"]),
  planId: z.string().optional(),
  roomId: z.string().optional(),
  boostType: z.enum(["PUSH", "FEATURED", "VIP"]).optional(),
  amount: z.coerce.number().int().positive().optional(),
  provider: z.enum(["CASH", "BANK_TRANSFER", "VNPAY", "MOMO", "ZALOPAY"]).default("BANK_TRANSFER"),
});

export async function createLandlordCheckoutIntent(input: z.input<typeof checkoutIntentSchema> & { userId: string }) {
  const parsed = checkoutIntentSchema.parse(input);
  const idempotencyKey = `checkout:${input.userId}:${parsed.type}:${parsed.planId ?? parsed.roomId ?? "wallet"}:${Date.now()}`;

  let billingRecordId: string | undefined;
  let amount = parsed.amount ?? 0;
  let metadata: Record<string, string | number | undefined> = { type: parsed.type };

  if (parsed.type === "plan" || parsed.type === "renew") {
    if (!parsed.planId) throw new AppError("Plan is required", 400, "PLAN_REQUIRED");
    const billing = await createSubscriptionPurchase({ userId: input.userId, planId: parsed.planId, idempotencyKey });
    billingRecordId = billing.id;
    amount = Number(billing.amount.toString());
    metadata = { ...metadata, billingCode: billing.code, planId: parsed.planId };
  }

  if (parsed.type === "boost") {
    if (!parsed.roomId) throw new AppError("Room is required", 400, "ROOM_REQUIRED");
    const boostType = (parsed.boostType ?? "FEATURED") as RoomBoostType;
    const boostPrice = parsed.amount ?? (boostType === "VIP" ? 199000 : boostType === "FEATURED" ? 99000 : 49000);
    const priority = boostType === "VIP" ? 100 : boostType === "FEATURED" ? 50 : 10;
    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setDate(endsAt.getDate() + 7);
    const billing = await createRoomBoost({ userId: input.userId, roomId: parsed.roomId, type: boostType, priority, startsAt, endsAt, idempotencyKey, price: boostPrice });
    billingRecordId = billing.id;
    amount = Number(billing.amount.toString());
    metadata = { ...metadata, billingCode: billing.code, roomId: parsed.roomId, boostType };
  }

  if (parsed.type === "wallet") {
    await ensureWallet(input.userId);
    amount = parsed.amount ?? 100000;
    const billing = await db.billingRecord.create({ data: { code: idempotencyKey, userId: input.userId, type: "WALLET_TOPUP", status: "PENDING", amount, metadata: { source: "wallet_topup" } } });
    billingRecordId = billing.id;
    metadata = { ...metadata, billingCode: billing.code };
  }

  if (!amount || amount <= 0) throw new AppError("Checkout amount must be positive", 400, "INVALID_CHECKOUT_AMOUNT");

  const intent = await db.paymentIntent.create({
    data: {
      userId: input.userId,
      provider: parsed.provider as PaymentProvider,
      status: "PENDING",
      amount,
      idempotencyKey,
      metadata: { ...metadata, billingRecordId, note: "Mock pending intent - gateway thật chưa tích hợp" },
    },
  });

  return { intent, billingRecordId };
}

const paymentIntentIdSchema = z.string().min(1).max(191);

export async function getLandlordPaymentStatus(userId: string, intentId: string) {
  const parsedIntentId = paymentIntentIdSchema.parse(intentId);
  const intent = await db.paymentIntent.findFirst({ where: { id: parsedIntentId, userId } });
  if (!intent) throw new AppError("Payment intent not found", 404, "PAYMENT_INTENT_NOT_FOUND");
  return intent;
}
