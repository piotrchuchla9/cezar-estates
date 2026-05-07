import { useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: string | HTMLElement, opts: { sitekey: string; callback: (token: string) => void }) => string;
      reset: (id?: string) => void;
    };
  }
}

interface Props { siteKey: string }

export default function ContactForm({ siteKey: _siteKey }: Props) {
  const [status, _setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  if (status === 'sent') {
    return (
      <div className="rounded-sm bg-white p-6 text-sm">
        Dziękujemy. Odezwiemy się w ciągu 24h.
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-3" aria-label="Formularz kontaktowy">
      <input name="name" placeholder="Imię i nazwisko" required className="h-11 border border-neutral-300 bg-white px-3 text-sm" />
      <input name="email" type="email" placeholder="Email" required className="h-11 border border-neutral-300 bg-white px-3 text-sm" />
      <input name="phone" placeholder="Telefon (opcjonalnie)" className="h-11 border border-neutral-300 bg-white px-3 text-sm" />
      <textarea name="message" placeholder="Wiadomość" rows={5} required className="border border-neutral-300 bg-white p-3 text-sm" />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0" />
      <label className="flex items-start gap-2 text-xs text-neutral-600">
        <input type="checkbox" required className="mt-0.5" />
        <span>Wyrażam zgodę na przetwarzanie moich danych osobowych w celu odpowiedzi na zapytanie (RODO).</span>
      </label>
      <button
        type="submit"
        disabled
        className="bg-[var(--color-accent)] py-3.5 font-semibold text-white text-[13px] tracking-wide disabled:opacity-50"
      >
        WYŚLIJ WIADOMOŚĆ →
      </button>
      <p className="text-[11px] text-neutral-500">Backend wired in Task 23.</p>
    </form>
  );
}
