
import { Text } from "@react-email/components";
import * as React from "react";
import { BaseEmailLayout } from "./TemplateMail";

interface CodeConfirmationProps {
  resetCode: string;
  pseudo: string;
}

const CodeConfirmation: React.FC<CodeConfirmationProps> = ({
  resetCode,
  pseudo,
}) => (
  <BaseEmailLayout title="Code de vérification">
    <Text style={{ fontSize: 16, color: "#222" }}>
      Bonjour <b>{pseudo}</b>,
    </Text>
    <Text style={{ fontSize: 16, color: "#222" }}>
      Voici votre code de vérification :
    </Text>
    <Text
      style={{
        fontWeight: "bold",
        fontSize: 28,
        color: "#d00027",
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

export default CodeConfirmation;
