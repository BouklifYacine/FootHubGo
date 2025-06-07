
import { Text } from "@react-email/components";
import * as React from "react";
import { BaseEmailLayout } from "./TemplateMail";

interface ResetPasswordEmailProps {
  resetCode: string;
}

const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({ resetCode }) => (
  <BaseEmailLayout title="Réinitialisation du mot de passe">
    <Text style={{ fontSize: 16, color: "#222" }}>
      Bonjour,
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Voici votre code de vérification :
    </Text>
    <Text
      style={{
        fontWeight: "bold",
        fontSize: 28,
        color: "#2563eb",
        letterSpacing: 2,
        margin: "16px 0",
        textAlign: "center",
      }}
    >
      {resetCode}
    </Text>
    <Text style={{ fontSize: 14, color: "#888" }}>
      Ce code expire dans 1 heure.
    </Text>
  </BaseEmailLayout>
);

export default ResetPasswordEmail;
