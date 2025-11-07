import { env } from "@/lib/env";
import { Client } from "@upstash/qstash";

let client: Client | null = null;

function getClient() {
  if (!env.QSTASH_TOKEN) return null;
  if (!client) {
    client = new Client({
      token: env.QSTASH_TOKEN,
      baseUrl: env.QSTASH_URL ?? "https://qstash.upstash.io"
    });
  }
  return client;
}

export async function enqueueSend(userId: string) {
  const qstash = getClient();
  if (!qstash) return false;
  await qstash.publish({
    url: `${env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/jobs/send?u=${userId}`,
    headers: {
      Authorization: `Bearer ${env.CRON_SECRET}`
    }
  });
  return true;
}
