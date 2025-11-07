import type { SavedContent } from "@prisma/client";
import { wrapTrackedUrl } from "@/lib/newsletter/linkify";

type Section = {
  subreddit: string;
  items: (SavedContent & { summary?: string })[];
};

type TemplateArgs = {
  items: (SavedContent & { summary?: string })[];
  newsletter: { id: string; subject: string };
  baseUrl: string;
  includeSummaries: boolean;
  unsubscribeUrl: string;
};

function groupBySubreddit(items: (SavedContent & { summary?: string })[]): Section[] {
  const map = new Map<string, Section>();
  for (const item of items) {
    const sub = item.subreddit ?? "unknown";
    if (!map.has(sub)) {
      map.set(sub, { subreddit: sub, items: [] });
    }
    map.get(sub)!.items.push(item);
  }
  return Array.from(map.values());
}

export function renderNewsletterHtml(args: TemplateArgs) {
  const sections = groupBySubreddit(args.items);
  const stats = {
    itemCount: args.items.length,
    subredditCount: sections.length
  };
  const shimmer = `
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .header { background: linear-gradient(120deg, #7F5AF0, #2CB1BC, #7F5AF0); background-size: 200% 200%; animation: shimmer 8s ease infinite; }
  `;
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #0f172a; color: #0f172a; }
      a { color: #7F5AF0; text-decoration: none; }
      h1 { margin: 0; font-size: 32px; color: white; }
      .container { margin: 0 auto; max-width: 640px; padding: 24px; }
      .card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px -24px rgba(127,90,240,0.5); }
      .stats { display: flex; gap: 12px; margin-top: 16px; }
      .chip { background: rgba(15,23,42,0.08); color: #0f172a; padding: 8px 16px; border-radius: 9999px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
      .section { padding: 24px; border-top: 1px solid rgba(15,23,42,0.08); }
      .section:first-of-type { border-top: none; }
      .item-title { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
      .summary { font-size: 14px; line-height: 1.5; color: #475569; margin: 0; }
      footer { text-align: center; color: #94a3b8; font-size: 12px; padding: 32px 0; }
      ${shimmer}
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header" style="padding: 40px; text-align: center;">
          <h1>SavedDigest</h1>
          <p style="color: rgba(255,255,255,0.8); margin-top: 8px;">${args.newsletter.subject}</p>
          <div class="stats">
            <span class="chip">${stats.itemCount} items</span>
            <span class="chip">${stats.subredditCount} subreddits</span>
          </div>
        </div>
        ${sections
          .map((section) => {
            const itemsHtml = section.items
              .map((item) => {
                const link = item.url
                  ? wrapTrackedUrl({
                      baseUrl: args.baseUrl,
                      newsletterId: args.newsletter.id,
                      savedId: item.id,
                      target: item.url
                    })
                  : "";
                return `
                <div class="item">
                  <a class="item-title" href="${link}" target="_blank" rel="noopener">${item.title ?? "View item"}</a>
                  ${args.includeSummaries && (item.aiSummary ?? item.summary) ? `<p class="summary">${item.aiSummary ?? item.summary}</p>` : ""}
                </div>
              `;
              })
              .join("\n");
            return `
              <div class="section">
                <h2 style="margin:0 0 12px 0;font-size:20px;">r/${section.subreddit}</h2>
                ${itemsHtml}
              </div>
            `;
          })
          .join("\n")}
        <div style="padding: 24px; border-top: 1px solid rgba(15,23,42,0.08);">
          <p style="font-size: 13px; color: #475569; margin-bottom: 16px;">Manage your preferences or unsubscribe below.</p>
          <p style="font-size: 13px; color: #475569;">Stay curious,<br/>SavedDigest</p>
        </div>
      </div>
      <footer>
        <a href="${args.baseUrl}/dashboard">Manage preferences</a> ·
        <a href="${args.unsubscribeUrl}">Unsubscribe</a>
        <img src="${args.baseUrl}/api/track/open?nl=${args.newsletter.id}" width="1" height="1" alt="" style="display:none;" />
      </footer>
    </div>
  </body>
</html>`;
}
