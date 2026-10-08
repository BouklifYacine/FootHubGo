import { Text } from "react-email";
import { EmailLayout, Greeting, mutedStyle, textStyle } from "./layout";

export function SubscriptionStartedEmail({ name, plan }: { name: string; plan: string }) {
  return (
    <EmailLayout title="Nouvel abonnement">
      <Greeting name={name} />
      <Text style={textStyle}>
        Merci pour ton abonnement au plan <b>{plan}</b> ! Il est maintenant actif.
      </Text>
      <Text style={mutedStyle}>L&apos;équipe FootHubGo</Text>
    </EmailLayout>
  );
}

export function SubscriptionChangedEmail({
  name,
  oldPlan,
  plan,
}: {
  name: string;
  oldPlan: string;
  plan: string;
}) {
  return (
    <EmailLayout title="Changement d'abonnement">
      <Greeting name={name} />
      <Text style={textStyle}>
        Tu es passé du plan <b>{oldPlan}</b> au plan <b>{plan}</b>.
      </Text>
      <Text style={mutedStyle}>Merci de ta confiance !</Text>
    </EmailLayout>
  );
}

export function SubscriptionCanceledEmail({ name, endDate }: { name: string; endDate?: Date }) {
  return (
    <EmailLayout title="Résiliation d'abonnement">
      <Greeting name={name} />
      <Text style={textStyle}>
        Nous confirmons la résiliation de ton abonnement <b>Pro</b>
        {endDate ? <>, actif jusqu&apos;au <b>{endDate.toLocaleDateString("fr-FR")}</b></> : null}.
      </Text>
      <Text style={textStyle}>Tu peux te réabonner à tout moment.</Text>
      <Text style={mutedStyle}>L&apos;équipe FootHubGo</Text>
    </EmailLayout>
  );
}
