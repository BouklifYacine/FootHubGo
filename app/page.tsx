import { SiteHeader } from "@/components/site-header";
import { Audience } from "@/components/landing/audience";
import { Faq } from "@/components/landing/faq";
import { FeaturesBento } from "@/components/landing/features-bento";
import { Hero } from "@/components/landing/hero";
import { Pricing } from "@/components/landing/pricing";
import { SiteFooter } from "@/components/landing/site-footer";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <Hero />
      <Audience />
      <section id="fonctionnalites" className="scroll-mt-20">
        <FeaturesBento />
      </section>
      <section id="tarifs" className="scroll-mt-20">
        <Pricing />
      </section>
      <section id="faq" className="scroll-mt-20">
        <Faq />
      </section>
      <SiteFooter />
    </>
  );
}
