"use client";

import { Announcement, AnnouncementTitle } from "@/components/ui/announcement";

interface Props {
  texte: number | string;
  icon?: React.ReactElement;
}

const BadgeTexteIcone = ({ texte, icon }: Props) => (
  <div className="">
    <Announcement>
      <AnnouncementTitle>
        {texte}
        {icon}
      </AnnouncementTitle>
    </Announcement>
  </div>
);

export { BadgeTexteIcone };
