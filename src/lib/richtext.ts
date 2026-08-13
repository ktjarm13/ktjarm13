/**
 * Prefix root-relative hrefs in CMS rich-text with Astro's `base`.
 *
 * CMS content stores bare paths like `/recipes` so Katie never types a
 * deployment path and the content survives the site moving to a different
 * GitHub account, where `base` changes. Absolute and protocol-relative URLs
 * are left alone, as are links that already carry the prefix.
 */
export function withBaseLinks(html: string, base: string): string {
  const trimmed = base.replace(/\/+$/, '');
  if (!trimmed) return html;

  const prefix = trimmed.replace(/^\//, '');
  return html.replace(/href="\/(?!\/)([^"]*)"/g, (match, path: string) =>
    path === prefix || path.startsWith(`${prefix}/`)
      ? match
      : `href="${trimmed}/${path}"`,
  );
}
