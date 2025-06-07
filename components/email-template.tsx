import * as React from 'react';

interface EmailTemplateProps {
  name: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
}) => (
  <div>
    <h1>Bienvenue a toi {name}!</h1>
  </div>
);