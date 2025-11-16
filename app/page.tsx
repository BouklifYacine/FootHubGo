import { CarouselComposant } from "@/components/Carousel/CarouselComposant";
import Faq from "@/components/Faq";
import { Footer } from "@/components/Footer/footer";
import Header from "@/components/header";
import { Pricing2 } from "@/components/pricing2";
import Section from "@/components/Section";
import { BentoDemo } from "@/components/ui/testbento";
import { TestimonialsSectionDemo } from "@/components/ui/TestTestimonials";

export default function Home() {
  return (
    <>
      <Header />
      <Section />
       <CarouselComposant />
       <BentoDemo></BentoDemo>
     <TestimonialsSectionDemo></TestimonialsSectionDemo>
      <Pricing2></Pricing2>
      <Faq></Faq>
      <Footer></Footer>
    </>
  );
}
