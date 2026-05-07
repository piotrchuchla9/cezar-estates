import { render } from '@react-email/render';
import { Resend } from 'resend';
import ContactNotification from '~/emails/ContactNotification';
import type { ContactInput } from './validation';

const apiKey = import.meta.env.RESEND_API_KEY;
const fromEmail = import.meta.env.CONTACT_FROM_EMAIL;
const toEmail = import.meta.env.CONTACT_EMAIL;

export async function sendContactEmail(input: ContactInput) {
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  const resend = new Resend(apiKey);

  const notifProps = {
    name: input.name,
    email: input.email,
    message: input.message,
    ...(input.phone ? { phone: input.phone } : {}),
  };
  const html = await render(ContactNotification(notifProps));

  const result = await resend.emails.send({
    from: `Cezar Estates <${fromEmail}>`,
    to: toEmail,
    replyTo: input.email,
    subject: `Nowe zapytanie od ${input.name}`,
    html,
  });

  if (result.error) throw new Error(`Resend: ${result.error.message}`);
  return result.data;
}
