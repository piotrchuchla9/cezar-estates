import { describe, expect, it } from 'vitest';
import { contactSchema } from './validation';

describe('contactSchema', () => {
  const valid = {
    name: 'Anna Kowalska',
    email: 'anna@example.com',
    phone: '+48 500 000 000',
    message: 'Chciałabym się dowiedzieć więcej o waszych realizacjach.',
    consent: true,
    website: '',
    turnstileToken: 'token123',
  };

  it('accepts valid input', () => {
    const result = contactSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = contactSchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects too-short message', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'too short' });
    expect(result.success).toBe(false);
  });

  it('rejects missing consent', () => {
    const result = contactSchema.safeParse({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });

  it('rejects honeypot fill', () => {
    const result = contactSchema.safeParse({ ...valid, website: 'http://spam.com' });
    expect(result.success).toBe(false);
  });

  it('accepts empty optional phone', () => {
    const result = contactSchema.safeParse({ ...valid, phone: '' });
    expect(result.success).toBe(true);
  });
});
