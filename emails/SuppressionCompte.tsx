
import { Text } from "@react-email/components";
import * as React from "react";
import { BaseEmailLayout } from "./TemplateMail";

interface SuppressionCompte {
  pseudo: string;
}

const EmailSuppressionCompte: React.FC<SuppressionCompte> = ({ pseudo }) => (
  <BaseEmailLayout title="Suppression de compte">
    <Text style={{ fontSize: 16, color: "#222" }}>
      Bonjour <b>{pseudo}</b>,
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Votre compte a été <b>supprimé définitivement</b>, ainsi que toutes les données associées.
    </Text>
    <Text style={{ fontSize: 14, color: "#888", marginTop: 24 }}>
      Si vous n’êtes pas à l’origine de cette action, contactez-nous immédiatement.
    </Text>
  </BaseEmailLayout>
);

export default EmailSuppressionCompte;
