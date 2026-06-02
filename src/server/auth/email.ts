import { env } from "@/lib/env/index";
import { logger } from "@/lib/logger";

export type AuthEmailKind = "verify-email" | "reset-password";

type AuthEmailInput = {
  kind: AuthEmailKind;
  to: string;
  token: string;
};

type EmailProvider = typeof env.EMAIL_PROVIDER;

function buildAuthUrl(kind: AuthEmailKind, token: string) {
  const path = kind === "verify-email" ? "/verify-email" : "/reset-password";
  return `${env.NEXT_PUBLIC_APP_URL}${path}?token=${encodeURIComponent(token)}`;
}

function subjectFor(kind: AuthEmailKind) {
  return kind === "verify-email" ? "Xác minh email Nhatrohaiphong.vn" : "Đặt lại mật khẩu Nhatrohaiphong.vn";
}

function textFor(input: AuthEmailInput) {
  const action = input.kind === "verify-email" ? "xác minh email" : "đặt lại mật khẩu";
  return `Vui lòng mở liên kết sau để ${action}: ${buildAuthUrl(input.kind, input.token)}`;
}

async function sendViaConfiguredProvider(provider: EmailProvider, input: AuthEmailInput) {
  const subject = subjectFor(input.kind);
  const text = textFor(input);

  if (provider === "console") {
    logger.info({ provider, to: input.to, subject, url: buildAuthUrl(input.kind, input.token) }, "Auth email queued in console provider");
    return;
  }

  logger.warn(
    {
      provider,
      to: input.to,
      subject,
      hasFrom: Boolean(env.EMAIL_FROM),
      hasResendKey: Boolean(env.RESEND_API_KEY),
      hasBrevoKey: Boolean(env.BREVO_API_KEY),
      hasSmtpConfig: Boolean(env.SMTP_HOST && env.SMTP_PORT),
      textPreview: text.slice(0, 80),
    },
    "Auth email provider abstraction configured but transport dependency is not installed",
  );
}

export async function sendAuthEmail(input: AuthEmailInput) {
  await sendViaConfiguredProvider(env.EMAIL_PROVIDER, input);
}

export function shouldExposeAuthDebugTokens() {
  return env.NODE_ENV !== "production" && env.AUTH_DEBUG_TOKENS;
}
