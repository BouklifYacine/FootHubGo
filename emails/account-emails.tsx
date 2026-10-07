import { Text } from "react-email";
import { EmailLayout, Greeting, mutedStyle, SecurityNotice, textStyle } from "./layout";

export function WelcomeEmail({ name }: { name: string }) {
  return (
    <EmailLayout title="Bienvenue !">
      <Greeting name={name} />
      <Text style={textStyle}>
        Nous sommes ravis de vous compter parmi nous. Créez ou rejoignez votre club pour commencer !
      </Text>
      <Text style={mutedStyle}>L&apos;équipe FootHubGo</Text>
    </EmailLayout>
  );
}

export function EmailChangedEmail({
  name,
  oldEmail,
  newEmail,
}: {
  name: string;
  oldEmail: string;
  newEmail: string;
}) {
  return (
    <EmailLayout title="Changement d'email">
      <Greeting name={name} />
      <Text style={textStyle}>
        Votre email a été modifié de <b>{oldEmail}</b> à <b>{newEmail}</b>.
      </Text>
      <SecurityNotice />
    </EmailLayout>
  );
}

export function NameChangedEmail({ oldName, newName }: { oldName: string; newName: string }) {
  return (
    <EmailLayout title="Changement de pseudo">
      <Greeting name={newName} />
      <Text style={textStyle}>
        Votre pseudo a été modifié de <b>{oldName}</b> à <b>{newName}</b>.
      </Text>
      <SecurityNotice />
    </EmailLayout>
  );
}

export function PasswordChangedEmail({ name }: { name: string }) {
  return (
    <EmailLayout title="Changement de mot de passe">
      <Greeting name={name} />
      <Text style={textStyle}>Votre mot de passe vient d&apos;être modifié.</Text>
      <SecurityNotice />
    </EmailLayout>
  );
}

export function AccountDeletedEmail({ name }: { name: string }) {
  return (
    <EmailLayout title="Suppression de compte">
      <Greeting name={name} />
      <Text style={textStyle}>
        Votre compte a été <b>supprimé définitivement</b>, ainsi que toutes les données associées.
      </Text>
      <Text style={mutedStyle}>
        Si vous n&apos;êtes pas à l&apos;origine de cette action, contactez-nous immédiatement.
      </Text>
    </EmailLayout>
  );
}
