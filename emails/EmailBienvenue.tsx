
import { Text } from "@react-email/components";
import * as React from "react";
import { BaseEmailLayout } from "./TemplateMail";

interface EmailBienvenueProps {
  name?: string;
}

const EmailBienvenue: React.FC<EmailBienvenueProps> = ({ name }) => (
  <BaseEmailLayout title="Bienvenue !">
    <Text style={{ fontSize: 16, color: "#222" }}>
      Bonjour <b>{name ?? "utilisateur"}</b>,
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Nous sommes ravis de vous compter parmi nous. Profitez pleinement de votre expérience sur notre plateforme !
    </Text>
    <Text style={{ fontSize: 14, color: "#888", marginTop: 24 }}>
      L’équipe de Votre Société
    </Text>
  </BaseEmailLayout>
);

export default EmailBienvenue;
