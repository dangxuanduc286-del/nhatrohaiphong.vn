import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const forbiddenSecretValues = new Set([
  "changeme",
  "change-me",
  "default",
  "default-secret",
  "jwt-secret",
  "secret",
  "your-secret",
  "your-jwt-secret",
  "replace-me",
  "placeholder",
]);

function isPlaceholder(value: string) {
  const normalized = value.trim().toLowerCase();
  return forbiddenSecretValues.has(normalized) || normalized.includes("placeholder") || normalized.includes("changeme") || normalized.includes("replace-me");
}

const productionSecret = z.string().min(32).superRefine((value, ctx) => {
  if (isPlaceholder(value)) {
    ctx.addIssue({ code: "custom", message: "Secret must not use a default or placeholder value" });
  }
});

const productionCookieName = z.string().min(3).superRefine((value, ctx) => {
  if (isPlaceholder(value)) {
    ctx.addIssue({ code: "custom", message: "Cookie name must not use a default or placeholder value" });
  }
});

const productionUrl = z.string().url().superRefine((value, ctx) => {
  if (isPlaceholder(value) || value.includes("example.com")) {
    ctx.addIssue({ code: "custom", message: "URL must not use a placeholder value" });
  }
});

export const env = createEnv({
  server: {
    DATABASE_URL: productionUrl,
    DIRECT_URL: productionUrl,
    REDIS_URL: productionUrl,
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    JWT_SECRET: productionSecret,
    ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
    REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(30),
    AUTH_COOKIE_NAME: productionCookieName,
    EMAIL_PROVIDER: z.enum(["console", "resend", "brevo", "smtp"]).default("console"),
    EMAIL_FROM: z.string().email().optional(),
    RESEND_API_KEY: z.string().optional(),
    BREVO_API_KEY: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    AUTH_DEBUG_TOKENS: z.coerce.boolean().default(false),
  },
  client: {
    NEXT_PUBLIC_APP_URL: productionUrl,
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    REDIS_URL: process.env.REDIS_URL,
    LOG_LEVEL: process.env.LOG_LEVEL,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN_DAYS: process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS,
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    EMAIL_FROM: process.env.EMAIL_FROM,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    AUTH_DEBUG_TOKENS: process.env.AUTH_DEBUG_TOKENS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  emptyStringAsUndefined: true,
});
