import { CarouselComposant } from "@/components/Carousel/CarouselComposant";
import Faq from "@/components/Faq";
import { Footer } from "@/components/Footer/footer";
import Header from "@/components/header";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { Pricing2 } from "@/components/pricing2";
import Section from "@/components/Section";

export default function Home() {
  return (
    <>
      <Header />
      <Section />
      <CarouselComposant />
      <section id="fonctionnalites" className="scroll-mt-20">
        <FeaturesBento />
      </section>
      <section id="tarifs" className="scroll-mt-20">
        <Pricing2 />
      </section>
      <section id="faq" className="scroll-mt-20">
        <Faq />
      </section>
      <Footer />
    </>
  );
}
