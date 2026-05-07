import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: string | HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void; 'error-callback'?: () => void },
      ) => string;
      reset: (id?: string) => void;
    };
  }
}

interface Props {
  siteKey: string;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm({ siteKey }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const turnstileTokenRef = useRef<string>('');
  const turnstileEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptId = 'cf-turnstile-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const tryRender = () => {
      if (window.turnstile && turnstileEl.current) {
        window.turnstile.render(turnstileEl.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            turnstileTokenRef.current = token;
          },
          'error-callback': () => {
            turnstileTokenRef.current = '';
          },
        });
        return true;
      }
      return false;
    };

    if (!tryRender()) {
      const id = setInterval(() => {
        if (tryRender()) clearInterval(id);
      }, 200);
      return () => clearInterval(id);
    }
  }, [siteKey]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      message: String(fd.get('message') ?? ''),
      consent: fd.get('consent') === 'on',
      website: String(fd.get('website') ?? ''),
      turnstileToken: turnstileTokenRef.current,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Wystąpił błąd');
      }
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Wystąpił błąd');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-sm bg-white p-6 text-sm">
        <div className="font-semibold text-[var(--color-accent)]">Dziękujemy.</div>
        <div className="mt-1 text-[var(--color-ink-muted)]">Odezwiemy się w ciągu 24 godzin.</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" aria-label="Formularz kontaktowy">
      <input
        name="name"
        placeholder="Imię i nazwisko"
        required
        className="h-11 border border-neutral-300 bg-white px-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="h-11 border border-neutral-300 bg-white px-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
      />
      <input
        name="phone"
        placeholder="Telefon (opcjonalnie)"
        className="h-11 border border-neutral-300 bg-white px-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
      />
      <textarea
        name="message"
        placeholder="Wiadomość"
        rows={5}
        required
        minLength={20}
        className="border border-neutral-300 bg-white p-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
      />
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0"
      />
      <label className="flex items-start gap-2 text-xs text-neutral-600">
        <input type="checkbox" name="consent" required className="mt-0.5" />
        <span>
          Wyrażam zgodę na przetwarzanie moich danych w celu odpowiedzi na zapytanie (RODO).
        </span>
      </label>
      <div ref={turnstileEl} />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-[var(--color-accent)] py-3.5 font-semibold text-white text-[13px] tracking-wide hover:opacity-90 disabled:opacity-50"
      >
        {status === 'sending' ? 'WYSYŁANIE…' : 'WYŚLIJ WIADOMOŚĆ →'}
      </button>
      {status === 'error' && <p className="text-sm text-red-700">{errorMsg}</p>}
    </form>
  );
}
