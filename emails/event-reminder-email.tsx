import { Button, Link, Text } from "react-email";
import { EmailLayout, Greeting, mutedStyle, textStyle } from "./layout";

type Props = {
  name: string;
  title: string;
  when: string;
  location: string | null;
  action: string;
  url: string;
  /** One-click link that turns these reminder emails off. */
  unsubscribeUrl: string;
};

/** Sent the day before a training or a match (see features/events/server/reminders.ts). */
export function EventReminderEmail({ name, title, when, location, action, url, unsubscribeUrl }: Props) {
  return (
    <EmailLayout title="Rappel">
      <Greeting name={name} />
      <Text style={textStyle}>
        <b>{title}</b> a lieu {when}
        {location ? ` (${location})` : ""}.
      </Text>
      <Text style={textStyle}>{action}</Text>
      <Button
        href={url}
        style={{ backgroundColor: "#16a34a", borderRadius: 6, color: "#fff", fontWeight: 600, padding: "10px 18px" }}
      >
        Ouvrir FootHubGo
      </Button>
      <Text style={mutedStyle}>L&apos;équipe FootHubGo</Text>
      <Text style={{ ...mutedStyle, fontSize: 12 }}>
        Tu reçois cet email car les rappels d&apos;événements sont activés.{" "}
        <Link href={unsubscribeUrl} style={{ color: "#888", textDecoration: "underline" }}>
          Ne plus recevoir ces rappels
        </Link>
      </Text>
    </EmailLayout>
  );
}
