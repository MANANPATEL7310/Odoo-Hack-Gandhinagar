import pino from "pino";

export const logger = pino({
  redact: [
    "req.headers.authorization",
    "req.body.password",
    "password",
    "token",
    "accessToken",
    "payload.password",
  ],
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
});
