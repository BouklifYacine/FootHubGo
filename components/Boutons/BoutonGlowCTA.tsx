import { GlowEffect } from '@/components/ui/glow-effect';
import { ArrowRight } from 'lucide-react';

interface Props {
  texte: string;
}

export function GlowEffectButton({ texte }: Props) {
  return (
    <div className="relative inline-block">
      <GlowEffect
        colors={['#FF5733', '#33FF57', '#3357FF', '#F1C40F']}
        mode="colorShift"
        blur="soft"
        duration={3}
        scale={0.9}
      />
      <button
        className="
          relative cursor-pointer inline-flex items-center gap-2
          rounded-3xl bg-zinc-950
          px-4 py-2 text-base
          md:px-8 md:py-4 md:text-xl
          text-zinc-50
          outline outline-[#fff2f21f]
          transition-all duration-200
          hover:scale-105 hover:bg-zinc-900
          focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none
        "
      >
        {texte}
        <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
      </button>
    </div>
  );
}
