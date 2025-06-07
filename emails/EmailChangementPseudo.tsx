
import { Text } from "@react-email/components";
import * as React from "react";
import { BaseEmailLayout } from "./TemplateMail";

interface EmailChangementPseudo {
  pseudo: string;
  name: string;
}

const EmailChangementPseudo: React.FC<EmailChangementPseudo> = ({
  name,
  pseudo,
}) => (
  <BaseEmailLayout title="Changement de pseudo">
    <Text style={{ fontSize: 16, color: "#222" }}>
      Bonjour <b>{name}</b>,
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Votre pseudo a été modifié de <b>{pseudo}</b> à <b>{name}</b>.
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Si ce changement n’est pas de votre fait, <b>sécurisez votre compte</b> immédiatement.
    </Text>
  </BaseEmailLayout>
);

export default EmailChangementPseudo;
