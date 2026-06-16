const DEFAULT_DELAY_MS = 750;
const MAX_RETRIES = 5;

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchDromexHtml(
  url: string,
  options?: { delayMs?: number }
) {
  const delayMs = options?.delayMs ?? DEFAULT_DELAY_MS;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const backoffMs = delayMs * 2 ** attempt;
      await sleep(backoffMs);
    } else {
      await sleep(delayMs);
    }

    const response = await fetch(url);

    if (response.ok) {
      return response.text();
    }

    if (response.status === 429 && attempt < MAX_RETRIES) {
      continue;
    }

    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  throw new Error(`Failed to fetch ${url} after ${MAX_RETRIES} retries`);
}
