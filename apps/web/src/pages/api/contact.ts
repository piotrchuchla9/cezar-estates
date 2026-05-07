import type { APIRoute } from 'astro';
import { contactSchema } from '~/lib/validation';
import { verifyTurnstile } from '~/lib/turnstile';
import { sendContactEmail } from '~/lib/resend';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Walidacja nieudana', issues: parsed.error.flatten() }, { status: 400 });
  }

  const ok = await verifyTurnstile(
    parsed.data.turnstileToken,
    import.meta.env.TURNSTILE_SECRET_KEY,
    clientAddress,
  );
  if (!ok) {
    return Response.json({ error: 'Weryfikacja antyspamowa nieudana' }, { status: 400 });
  }

  try {
    await sendContactEmail(parsed.data);
    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Contact email failed:', err);
    return Response.json({ error: 'Wysyłka nie powiodła się' }, { status: 500 });
  }
};
