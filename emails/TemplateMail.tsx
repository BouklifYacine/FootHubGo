import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  // Img, // react-email a son propre composant Img optimisé pour les emails
} from "@react-email/components";

import * as React from "react";

interface BaseEmailLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const BaseEmailLayout: React.FC<BaseEmailLayoutProps> = ({
  children,
  title = "Notification",
}) => (
  <Html>
    <Head />
    <Body
      style={{
        backgroundColor: "#f4f4f7",
        fontFamily: "Inter, Arial, sans-serif",
        margin: 0,
        padding: 0,
      }}
    >
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
          {/* Utilise une balise <img> standard ou le composant Img de react-email */}
          {/* L'URL de l'image DOIT être une URL absolue accessible publiquement */}
          {/* <img // Ou <Img> de @react-email/components
            src="URL_ABSOLUE_DE_TON_IMAGE/Logo_FC_Liverpool.svg.png" // Exemple: https://tonsite.com/images/Logo_FC_Liverpool.svg.png
            alt="Logo"
            width={48} // width et height sont bien supportés
            height={48}
            style={{ borderRadius: 8, marginBottom: 8 }}
          /> */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#222",
              margin: 0,
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Text>
        </Section>
        <Section>{children}</Section>
        <Section style={{ marginTop: 32, textAlign: "center" }}>
          <Text
            style={{
              fontSize: 12,
              color: "#888",
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} Votre Société. Tous droits réservés.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);
