import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Imię jest wymagane').max(120),
  email: z.string().trim().email('Nieprawidłowy email').max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  message: z.string().trim().min(20, 'Wiadomość zbyt krótka (min 20 znaków)').max(5000),
  consent: z.literal(true, { errorMap: () => ({ message: 'Zgoda RODO wymagana' }) }),
  website: z.literal('', { errorMap: () => ({ message: 'spam' }) }),
  turnstileToken: z.string().min(1),
});

export type ContactInput = z.infer<typeof contactSchema>;
