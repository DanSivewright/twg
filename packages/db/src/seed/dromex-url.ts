const STAGING_HOST = "wordpress-1354898-6470616.cloudwaysapps.com";
const PRODUCTION_HOST = "dromex.co.za";

const NITROCDN_DROMEX_PATH = /dromex\.co\.za(\/wp-content\/uploads\/[^?#]+)/i;

export function normalizeDromexUrl(url: string): string {
  try {
    const nitroMatch = url.match(NITROCDN_DROMEX_PATH);
    if (nitroMatch?.[1]) {
      return `https://${PRODUCTION_HOST}${nitroMatch[1]}`;
    }

    const parsed = new URL(url);
    if (parsed.hostname === STAGING_HOST) {
      parsed.hostname = PRODUCTION_HOST;
      parsed.protocol = "https:";
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function normalizeDromexUrls<T>(value: T): T {
  if (typeof value === "string") {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return normalizeDromexUrl(value) as T;
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeDromexUrls(item)) as T;
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        normalizeDromexUrls(item),
      ])
    ) as T;
  }

  return value;
}
