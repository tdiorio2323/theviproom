import { z } from "zod";

const envSchema = z.object({
  BUILDER_PUBLIC_KEY: z.string().min(1),
  VIP_CODES: z.string().default(""),
  VIP_COOKIE_NAME: z.string().default("td_vip"),
  VIP_COOKIE_DOMAIN: z.string().optional(),
  VIP_SESSION_MINUTES: z.string().optional(),
});

export const env = envSchema.parse({
  BUILDER_PUBLIC_KEY: process.env.BUILDER_PUBLIC_KEY,
  VIP_CODES: process.env.VIP_CODES,
  VIP_COOKIE_NAME: process.env.VIP_COOKIE_NAME,
  VIP_COOKIE_DOMAIN: process.env.VIP_COOKIE_DOMAIN,
  VIP_SESSION_MINUTES: process.env.VIP_SESSION_MINUTES,
});

export const VIP_CODES = new Set(
  env.VIP_CODES
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);

export const VIP_COOKIE_NAME = env.VIP_COOKIE_NAME;
export const VIP_COOKIE_DOMAIN = env.VIP_COOKIE_DOMAIN || undefined;
export const VIP_SESSION_MINUTES = Number(env.VIP_SESSION_MINUTES || 24 * 60);
