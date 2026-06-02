import pino from "pino";

import { env } from "@/lib/env/index";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: undefined,
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            singleLine: true,
          },
        }
      : undefined,
});
