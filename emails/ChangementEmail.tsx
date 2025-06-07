
import { Text } from "@react-email/components";
import * as React from "react";
import { BaseEmailLayout } from "./TemplateMail";

interface EmailChangementProps {
  email: string;
  ancienemail: string;
  pseudo: string;
}

const EmailChangement: React.FC<EmailChangementProps> = ({
  email,
  ancienemail,
  pseudo,
}) => (
  <BaseEmailLayout title="Changement d’email">
    <Text style={{ fontSize: 16, color: "#222" }}>
      Bonjour <b>{pseudo}</b>,
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Votre email a été modifié de <b>{ancienemail}</b> à <b>{email}</b>.
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Si ce changement n’est pas de votre fait, <b>sécurisez votre compte</b> immédiatement.
    </Text>
  </BaseEmailLayout>
);

export default EmailChangement;
