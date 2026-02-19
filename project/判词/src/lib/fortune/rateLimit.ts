const WINDOW_MS = 60_000;
const LIMIT = 20;

const bucket = new Map<string, number[]>();

export const checkRateLimit = (ip: string): { allowed: boolean; retryAfterSec?: number } => {
  const now = Date.now();
  const key = ip || "anonymous";
  const timestamps = bucket.get(key) ?? [];
  const withinWindow = timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (withinWindow.length >= LIMIT) {
    const oldest = withinWindow[0];
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
    bucket.set(key, withinWindow);
    return { allowed: false, retryAfterSec };
  }

  withinWindow.push(now);
  bucket.set(key, withinWindow);
  return { allowed: true };
};

export const clearRateLimitStore = (): void => {
  bucket.clear();
};
