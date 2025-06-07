
import { Text } from "@react-email/components";
import * as React from "react";
import { BaseEmailLayout } from "./TemplateMail";

interface NotifChangementMotDePasse {
  pseudo: string;
}

const NotifChangementMotDePasse: React.FC<NotifChangementMotDePasse> = ({
  pseudo,
}) => (
  <BaseEmailLayout title="Changement de mot de passe">
    <Text style={{ fontSize: 16, color: "#222" }}>
      Bonjour <b>{pseudo}</b>,
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Vous recevez ce mail car votre mot de passe vient d’être modifié.
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Si ce changement n’est pas de votre fait, <b>sécurisez votre compte</b> immédiatement.
    </Text>
  </BaseEmailLayout>
);

export default NotifChangementMotDePasse;
