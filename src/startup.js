// Reviewed fetch-retry subset from lunden-3d-apartment@502404a25063b954349a858edf72a74eaa02d14e (#1065).
import { STARTUP } from './config.js';

/** Bound each request and body. Retry one transient failure before abandoning the scene. */
export async function fetchStartupJSON(url, {
  fetcher = globalThis.fetch, timeout = STARTUP.dataTimeout,
  attempts = STARTUP.dataAttempts, retryDelay = STARTUP.retryDelay,
} = {}) {
  const count = Number.isInteger(attempts) ? Math.max(1, Math.min(attempts, 3)) : 1;
  for (let attempt = 0; attempt < count; attempt++) {
    const controller = new AbortController();
    let timer;
    try {
      return await Promise.race([
        (async () => {
          const response = await fetcher(url, {
            signal: controller.signal, ...(attempt ? { cache: 'no-store' } : {}),
          });
          if (!response.ok) {
            const error = Error(`Startup data: ${response.status}`);
            error.retryable = response.status === 408 || response.status === 429 || response.status >= 500;
            throw error;
          }
          return response.json();
        })(),
        new Promise((_, reject) => {
          timer = setTimeout(() => { controller.abort(); reject(Error('Startup data timeout')); }, timeout);
        }),
      ]);
    } catch (error) {
      if (attempt + 1 === count || error?.retryable === false || error?.name === 'SyntaxError') throw error;
    } finally { clearTimeout(timer); controller.abort(); }
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }
}

