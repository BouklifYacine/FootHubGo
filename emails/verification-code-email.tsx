import { Text } from "react-email";
import { EmailLayout, Greeting, mutedStyle, textStyle } from "./layout";

/** One-time code (password reset, settings confirmation). */
export function VerificationCodeEmail({
  code,
  name,
  title = "Code de vérification",
  expiresInMinutes,
}: {
  code: string;
  name?: string | null;
  title?: string;
  expiresInMinutes: number;
}) {
  return (
    <EmailLayout title={title}>
      <Greeting name={name} />
      <Text style={textStyle}>Voici votre code de vérification :</Text>
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 28,
          color: "#2563eb",
          letterSpacing: 4,
          margin: "16px 0",
          textAlign: "center",
        }}
      >
        {code}
      </Text>
      <Text style={mutedStyle}>
        Ce code expire dans {expiresInMinutes} minutes. Si vous n&apos;êtes pas à l&apos;origine de
        cette demande, ignorez cet email.
      </Text>
    </EmailLayout>
  );
}
