import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { renderNewsletterHtml } from "@/lib/newsletter/templates/default";
import { sendEmail } from "@/lib/email/sendgrid";
import { generateSummary } from "@/lib/ai/summarize";

function deterministicSubject(subs: string[]) {
  if (!subs.length) return "SavedDigest";
  return `SavedDigest • ${subs.slice(0, 4).map((s) => `r/${s}`).join(" • ")}`;
}

async function aiSubject(context: { subs: string[]; itemCount: number }) {
  if (!env.OPENAI_API_KEY) {
    return null;
  }
  const prompt = `You craft email subject lines for newsletters summarizing Reddit saves. Create a catchy subject under 70 characters for ${context.itemCount} items from ${context.subs.map((s) => `r/${s}`).join(", ")}.`;
  try {
    const summary = await generateSummary(prompt);
    return summary?.slice(0, 70) ?? null;
  } catch (err) {
    console.error("Failed to create AI subject", err);
    return null;
  }
}

type BuildOptions = {
  userId: string;
  preview?: boolean;
  send?: boolean;
};

export async function selectItemsForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { preferences: true }
  });
  if (!user || !user.preferences) return [];
  const prefs = user.preferences;
  const includeSubs = new Set(prefs.includeSubs.map((s) => s.toLowerCase()));
  const excludeSubs = new Set(prefs.excludeSubs.map((s) => s.toLowerCase()));

  const candidates = await prisma.savedContent.findMany({
    where: {
      userId,
      included: false
    },
    orderBy: {
      savedAtUtc: "desc"
    }
  });

  const filtered: typeof candidates = [];
  const perSubCounts = new Map<string, number>();
  for (const item of candidates) {
    const sub = (item.subreddit ?? "").toLowerCase();
    if (excludeSubs.size && excludeSubs.has(sub)) continue;
    if (includeSubs.size && sub && !includeSubs.has(sub)) continue;
    const current = perSubCounts.get(sub) ?? 0;
    if (current >= prefs.maxPerSub) continue;
    filtered.push(item);
    perSubCounts.set(sub, current + 1);
    if (filtered.length >= prefs.maxItems) break;
  }
  return filtered;
}

export async function buildNewsletter({ userId, preview = false, send = false }: BuildOptions) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      preferences: true,
      accounts: true
    }
  });
  if (!user) throw new Error("User not found");
  const prefs = user.preferences;
  if (!prefs || !prefs.enabled || prefs.frequency === "paused") {
    throw new Error("Newsletter disabled for user");
  }

  const items = await selectItemsForUser(userId);
  if (!items.length) {
    return { status: "noop", items: [] as typeof items };
  }
  if (prefs.aiEnabled) {
    await Promise.all(
      items.map(async (item) => {
        if (!item.previewText || item.aiSummary) return;
        try {
          const summary = await generateSummary(item.previewText, item.subreddit ?? undefined);
          if (summary) {
            await prisma.savedContent.update({
              where: { id: item.id },
              data: { aiSummary: summary }
            });
            item.aiSummary = summary;
          }
        } catch (err) {
          console.error("Failed to summarize", err);
        }
      })
    );
  }

  const subs = Array.from(new Set(items.map((item) => item.subreddit ?? ""))).filter(Boolean);
  const subjectB = deterministicSubject(subs);
  const subjectA = await aiSubject({ subs, itemCount: items.length });
  const variant = subjectA && Math.random() > 0.5 ? "A" : "B";
  const subject = variant === "A" && subjectA ? subjectA : subjectB;
  const baseUrl = env.NEXTAUTH_URL ?? "http://localhost:3000";
  const unsubscribeUrl = `${baseUrl}/api/unsubscribe?u=${user.id}&t=${user.id.split("").reverse().join("")}`;

  const previewHtml = renderNewsletterHtml({
    items,
    newsletter: { id: "preview", subject },
    baseUrl,
    includeSummaries: prefs.aiEnabled,
    unsubscribeUrl
  });

  if (preview) {
    return { status: "preview", subject, html: previewHtml, variant, items };
  }

  const newsletter = await prisma.newsletter.create({
    data: {
      userId: user.id,
      subject,
      subjectVariant: variant,
      html: previewHtml
    }
  });

  const finalHtml = renderNewsletterHtml({
    items,
    newsletter: { id: newsletter.id, subject },
    baseUrl,
    includeSummaries: prefs.aiEnabled,
    unsubscribeUrl
  });

  await prisma.$transaction([
    prisma.newsletter.update({
      where: { id: newsletter.id },
      data: { html: finalHtml }
    }),
    ...items.map((item) =>
      prisma.newsletterItem.create({
        data: {
          newsletterId: newsletter.id,
          savedContentId: item.id
        }
      })
    ),
    prisma.savedContent.updateMany({
      where: { id: { in: items.map((i) => i.id) } },
      data: { included: true }
    }),
    prisma.userPreferences.update({
      where: { userId: user.id },
      data: { lastSentAt: new Date() }
    })
  ]);

  if (send && user.email) {
    await sendEmail({ to: user.email, subject, html: finalHtml });
  }

  return { status: "created", newsletterId: newsletter.id, subject, variant, items };
}
