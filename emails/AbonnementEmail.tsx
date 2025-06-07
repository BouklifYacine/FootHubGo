
import { Text } from "@react-email/components";
import * as React from "react";
import { BaseEmailLayout } from "./TemplateMail";

interface EmailProps {
  name?: string;
  plan?: string;
}

interface EmailChangementAbonnementProps {
  name?: string;
  plan?: string;
  oldPlan?: string;
}

export const EmailNouvelAbonnement: React.FC<EmailProps> = ({
  name,
  plan,
}) => (
  <BaseEmailLayout title="Nouvel abonnement">
    <Text style={{ fontSize: 16, color: "#222" }}>
      Bonjour <b>{name ?? "utilisateur"}</b>,
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Merci pour votre abonnement au plan <b>{plan}</b> !
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Votre abonnement est maintenant actif. Profitez-en bien !
    </Text>
    <Text style={{ fontSize: 14, color: "#888", marginTop: 24 }}>
      L’équipe Liverpool FC
    </Text>
  </BaseEmailLayout>
);

export const EmailChangementAbonnement: React.FC<EmailChangementAbonnementProps> = ({
  name,
  plan,
  oldPlan,
}) => (
  <BaseEmailLayout title="Changement d’abonnement">
    <Text style={{ fontSize: 16, color: "#222" }}>
      Bonjour <b>{name ?? "utilisateur"}</b>,
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Votre changement d’abonnement a été effectué avec succès.
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Vous êtes passé du plan <b>{oldPlan}</b> au plan <b>{plan}</b>.
    </Text>
    <Text style={{ fontSize: 14, color: "#888", marginTop: 24 }}>
      Merci de votre confiance !
    </Text>
  </BaseEmailLayout>
);
  
export const EmailSuppressionAbonnement: React.FC<EmailProps> = ({
  name,
  plan,
}) => (
  <BaseEmailLayout title="Résiliation d’abonnement">
    <Text style={{ fontSize: 16, color: "#222" }}>
      Bonjour <b>{name ?? "utilisateur"}</b>,
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Nous confirmons la résiliation de votre abonnement <b>{plan}</b>.
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Vous pouvez nous recontacter si vous souhaitez vous réabonner.
    </Text>
    <Text style={{ fontSize: 14, color: "#888", marginTop: 24 }}>
      L’équipe Liverpool FC
    </Text>
  </BaseEmailLayout>
);
  
