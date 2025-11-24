import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";

import { Blessure } from "@prisma/client";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { InjuryActionsMenu } from "./InjuryActionsMenu";

dayjs.locale("fr");

export default function TimelineComponent({
  injuries,
  sessionId,
}: {
  injuries: Blessure[];
  sessionId: string;
}) {
  // Safety check: ensure injuries is an array
  const injuriesArray = Array.isArray(injuries) ? injuries : [];

  return (
    <Timeline defaultValue={injuriesArray.length}>
      {injuriesArray.map((injury, index) => (
        <TimelineItem
          key={injury.id}
          step={index + 1}
          className="sm:group-data-[orientation=vertical]/timeline:ms-32"
        >
          <TimelineHeader>
            <TimelineSeparator />
            <TimelineDate className="sm:group-data-[orientation=vertical]/timeline:absolute sm:group-data-[orientation=vertical]/timeline:-left-32 sm:group-data-[orientation=vertical]/timeline:w-20 sm:group-data-[orientation=vertical]/timeline:text-right">
              {dayjs(injury.startDate).format("DD MMM YYYY")}
            </TimelineDate>
            <div className="flex items-center justify-between w-full">
              <TimelineTitle className="sm:-mt-0.5 text-base">
                Type de blessure : {injury.type}
              </TimelineTitle>
              <InjuryActionsMenu injury={injury} sessionId={sessionId} />
            </div>
            <TimelineIndicator />
          </TimelineHeader>
          <TimelineContent>
            <div className="text-sm font-medium mb-1">
              Retour : {dayjs(injury.endDate).format("DD MMM YYYY")}
            </div>
            {injury.description && (
              <div className="opacity-45">{injury.description}</div>
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
