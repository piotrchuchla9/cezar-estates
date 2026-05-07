import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface Props {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export default function ContactNotification({ name, email, phone, message }: Props) {
  return (
    <Html lang="pl">
      <Head />
      <Preview>{`Nowe zapytanie od ${name}`}</Preview>
      <Body
        style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#fafaf7', padding: 24 }}
      >
        <Container style={{ background: 'white', padding: 24, maxWidth: 600 }}>
          <Heading as="h1" style={{ fontSize: 20, marginBottom: 16, color: '#1F3A2E' }}>
            Nowe zapytanie z formularza
          </Heading>
          <Section>
            <Text>
              <strong>Imię:</strong> {name}
            </Text>
            <Text>
              <strong>Email:</strong> {email}
            </Text>
            {phone && (
              <Text>
                <strong>Telefon:</strong> {phone}
              </Text>
            )}
          </Section>
          <Section style={{ borderTop: '1px solid #e5e2da', paddingTop: 16, marginTop: 16 }}>
            <Text style={{ whiteSpace: 'pre-wrap' }}>{message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
