const DEFAULT_TIMEOUT_MS = 5_000;

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const sourceSignal = init?.signal;

  if (sourceSignal) {
    if (sourceSignal.aborted) {
      controller.abort(sourceSignal.reason);
    } else {
      sourceSignal.addEventListener("abort", () => controller.abort(sourceSignal.reason), { once: true });
    }
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
