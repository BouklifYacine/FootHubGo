import type { ReactNode } from "react";
import { Body, Container, Head, Html, Section, Text } from "react-email";

export const textStyle = { fontSize: 16, color: "#222" };
export const mutedStyle = { fontSize: 14, color: "#888", marginTop: 24 };

/** Shared frame of every transactional email. */
export function EmailLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f4f4f7", fontFamily: "Inter, Arial, sans-serif", margin: 0 }}>
        <Container
          style={{
            backgroundColor: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            maxWidth: 480,
            margin: "40px auto",
            padding: "32px 24px",
          }}
        >
          <Section style={{ textAlign: "center", marginBottom: 24 }}>
            <Text style={{ fontSize: 22, fontWeight: 700, color: "#222", margin: 0 }}>{title}</Text>
          </Section>
          <Section>{children}</Section>
          <Section style={{ marginTop: 32, textAlign: "center" }}>
            <Text style={{ fontSize: 12, color: "#888", margin: 0 }}>
              © {new Date().getFullYear()} FootHubGo. Tous droits réservés.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function Greeting({ name }: { name?: string | null }) {
  return (
    <Text style={textStyle}>
      Bonjour <b>{name || "utilisateur"}</b>,
    </Text>
  );
}

export function SecurityNotice() {
  return (
    <Text style={textStyle}>
      Si ce changement n&apos;est pas de ton fait, <b>sécurise ton compte</b> immédiatement.
    </Text>
  );
}
