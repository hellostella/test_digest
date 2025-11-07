export function wrapTrackedUrl({
  baseUrl,
  newsletterId,
  savedId,
  target
}: {
  baseUrl: string;
  newsletterId: string;
  savedId: string;
  target: string;
}) {
  const encoded = encodeURIComponent(target);
  return `${baseUrl}/api/track/click?nl=${newsletterId}&sid=${savedId}&u=${encoded}`;
}
