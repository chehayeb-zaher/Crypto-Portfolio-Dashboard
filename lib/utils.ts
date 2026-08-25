const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
};

/**
 * CoinGecko's coin descriptions come as HTML strings. We only ever want
 * plain text here (rendering raw HTML from a third-party API would be an
 * XSS risk), so strip tags and decode the handful of entities that show up.
 */
export function stripHtml(html: string): string {
  const withoutTags = html.replace(/<[^>]*>/g, "");
  return withoutTags
    .replace(/&amp;|&quot;|&#39;|&lt;|&gt;|&nbsp;/g, (m) => HTML_ENTITIES[m])
    .trim();
}
