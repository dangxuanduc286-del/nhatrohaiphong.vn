import { z } from "zod";

const optionalEmail = z.string().trim().email("Email không hợp lệ").toLowerCase().optional().or(z.literal(""));
const optionalPhone = z.string().trim().min(8, "Số điện thoại không hợp lệ").max(20, "Số điện thoại không hợp lệ").optional().or(z.literal(""));

export function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase();
}

export function isEmailIdentifier(value: string) {
  return normalizeIdentifier(value).includes("@");
}

export const registerSchema = z
  .object({
    fullName: z.string().trim().max(120).optional().or(z.literal("")),
    email: optionalEmail,
    phone: optionalPhone,
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự").max(128),
    role: z.enum(["USER", "LANDLORD"]).default("USER"),
  })
  .superRefine((value, ctx) => {
    if (!value.email && !value.phone) {
      ctx.addIssue({ code: "custom", path: ["identifier"], message: "Vui lòng nhập email hoặc số điện thoại" });
    }
  })
  .transform((value) => ({
    ...value,
    fullName: value.fullName || "Người dùng Nhatrohaiphong",
    email: value.email || undefined,
    phone: value.phone || undefined,
  }));

export const loginSchema = z
  .object({
    identifier: z.string().trim().optional(),
    email: z.string().trim().optional(),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  })
  .superRefine((value, ctx) => {
    if (!value.identifier && !value.email) {
      ctx.addIssue({ code: "custom", path: ["identifier"], message: "Vui lòng nhập email hoặc số điện thoại" });
    }
  })
  .transform((value) => ({
    identifier: normalizeIdentifier(value.identifier || value.email || ""),
    password: value.password,
  }));

export const forgotPasswordSchema = z
  .object({
    identifier: z.string().trim().optional(),
    email: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.identifier && !value.email) {
      ctx.addIssue({ code: "custom", path: ["identifier"], message: "Vui lòng nhập email hoặc số điện thoại" });
    }
  })
  .transform((value) => ({
    identifier: normalizeIdentifier(value.identifier || value.email || ""),
  }));

export const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8).max(128),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(32),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  password: z.string().min(8).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
