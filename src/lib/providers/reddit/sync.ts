import { createRedditClient } from "@/lib/providers/reddit";
import { prisma } from "@/lib/prisma";
import type { User, Account } from "@prisma/client";
import { generateSummary } from "@/lib/ai/summarize";

type SyncResult = {
  imported: number;
  summarized: number;
};

function parseSavedItem(item: any) {
  const kind = item instanceof Object && item.body ? "comment" : "post";
  const permalink = item.permalink ? `https://reddit.com${item.permalink}` : undefined;
  return {
    externalId: item.id,
    kind,
    title: item.title ?? (kind === "comment" ? `Comment by ${item.author?.name}` : "Untitled"),
    url: item.url ?? item.link_url ?? permalink,
    subreddit: item.subreddit?.display_name ?? item.subreddit?.name,
    author: item.author?.name,
    score: item.score ?? null,
    numComments: item.num_comments ?? null,
    createdAtUtc: item.created_utc ? new Date(item.created_utc * 1000) : null,
    savedAtUtc: item.saved_utc ? new Date(item.saved_utc * 1000) : new Date(),
    previewText: (item.selftext ?? item.body ?? "").slice(0, 400)
  };
}

export async function syncRedditSaves(user: User & { accounts: Account[] }) {
  const redditAccount = user.accounts.find((acc) => acc.provider === "reddit");
  if (!redditAccount) {
    throw new Error("No Reddit account connected");
  }
  const client = createRedditClient(redditAccount);
  let after: string | undefined;
  let imported = 0;
  let summarized = 0;

  while (true) {
    const listing: any = await client.getMe().getSavedContent({ limit: 100, after });
    if (!listing || !Array.isArray(listing) || listing.length === 0) {
      break;
    }
    after = listing[listing.length - 1]?.name;
    for (const item of listing) {
      const parsed = parseSavedItem(item);
      const saved = await prisma.savedContent.upsert({
        where: {
          userId_provider_externalId: {
            userId: user.id,
            provider: "reddit",
            externalId: parsed.externalId
          }
        },
        update: {
          ...parsed
        },
        create: {
          userId: user.id,
          provider: "reddit",
          ...parsed
        }
      });
      imported += 1;
      if (parsed.previewText && !saved.aiSummary) {
        const summary = await generateSummary(parsed.previewText, parsed.subreddit ?? undefined);
        if (summary) {
          await prisma.savedContent.update({
            where: { id: saved.id },
            data: { aiSummary: summary }
          });
          summarized += 1;
        }
      }
    }
    if (!after) break;
  }

  return { imported, summarized } as SyncResult;
}
