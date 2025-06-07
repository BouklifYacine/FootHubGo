'use client';

import {
  Announcement,
  AnnouncementTitle,
} from '@/components/ui/announcement';
import { ArrowUpRightIcon } from 'lucide-react';

interface Props {
  texte : number
}

const BadgeTexteIcone = ({texte} : Props) => (
  <div className="flex w-full h-screen items-center justify-center gap-4">
    <Announcement>
      <AnnouncementTitle>
        {texte}
        <ArrowUpRightIcon size={16} className="shrink-0 text-muted-foreground" />
      </AnnouncementTitle>
    </Announcement>
  </div>
);

export { BadgeTexteIcone };