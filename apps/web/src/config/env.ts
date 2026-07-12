import { z } from "zod";

const envSchema = z.object({
  VITE_APP_NAME: z.string().min(1),
  VITE_API_URL: z.string().url(),
  VITE_USE_MOCK_DATA: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
});

export const env = envSchema.parse(import.meta.env);
