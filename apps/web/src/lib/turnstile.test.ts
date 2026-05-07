import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyTurnstile } from './turnstile';

describe('verifyTurnstile', () => {
  const fetchMock = vi.fn();
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.resetAllMocks();
  });

  it('returns true when Cloudflare reports success', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ success: true }) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const ok = await verifyTurnstile('token', 'secret', '1.2.3.4');
    expect(ok).toBe(true);
  });

  it('returns false when Cloudflare reports failure', async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => ({ success: false }) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const ok = await verifyTurnstile('token', 'secret');
    expect(ok).toBe(false);
  });

  it('returns false on network error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network'));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const ok = await verifyTurnstile('token', 'secret');
    expect(ok).toBe(false);
  });
});
