import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SHADOW_DATABASE_URL: z.string().url().optional(),
  REDDIT_CLIENT_ID: z.string().min(1),
  REDDIT_CLIENT_SECRET: z.string().min(1),
  REDDIT_REDIRECT_URI: z.string().url().optional(),
  USER_AGENT: z.string().min(1),
  SENDGRID_API_KEY: z.string().min(1).optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  SENDGRID_FROM_NAME: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  QSTASH_TOKEN: z.string().optional(),
  QSTASH_URL: z.string().optional(),
  QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
  QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
  ENCRYPTION_KEY: z.string().min(32),
  SCHEDULER_MIN_INTERVAL_MINUTES: z.coerce.number().default(5)
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  SHADOW_DATABASE_URL: process.env.SHADOW_DATABASE_URL,
  REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
  REDDIT_REDIRECT_URI: process.env.REDDIT_REDIRECT_URI,
  USER_AGENT: process.env.USER_AGENT,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
  SENDGRID_FROM_NAME: process.env.SENDGRID_FROM_NAME,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  CRON_SECRET: process.env.CRON_SECRET,
  QSTASH_TOKEN: process.env.QSTASH_TOKEN,
  QSTASH_URL: process.env.QSTASH_URL,
  QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
  QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  SCHEDULER_MIN_INTERVAL_MINUTES: process.env.SCHEDULER_MIN_INTERVAL_MINUTES
});

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
