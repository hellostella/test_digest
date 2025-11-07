import Snoowrap from "snoowrap";
import { env } from "@/lib/env";
import type { Account } from "@prisma/client";

export function createRedditClient(account: Account) {
  if (!account.refresh_token) {
    throw new Error("Reddit account missing refresh token");
  }
  return new Snoowrap({
    userAgent: env.USER_AGENT,
    clientId: env.REDDIT_CLIENT_ID,
    clientSecret: env.REDDIT_CLIENT_SECRET,
    refreshToken: account.refresh_token
  });
}
