/**
 * Join a root-relative path onto Astro's configured `base`.
 *
 * `BASE_URL` may or may not carry a trailing slash depending on config, and
 * naive template concatenation silently produces `/basefavicon.svg`. Every
 * internal link and asset path goes through here so the site survives being
 * moved to a different GitHub account, where `base` changes.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const suffix = path.replace(/^\/+/, '');
  return suffix ? `${base}/${suffix}` : `${base}/`;
}
