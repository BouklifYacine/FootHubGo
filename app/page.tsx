import { CarouselComposant } from "@/components/Carousel/CarouselComposant";
import Faq from "@/components/Faq";
import { Footer } from "@/components/Footer/footer";
import Header from "@/components/header";
import { Pricing2 } from "@/components/pricing2";
import Section from "@/components/Section";

export default function Home() {
  return (
    <>
      <Header />
      <Section />
       <CarouselComposant />
      <Pricing2></Pricing2>
      <Faq></Faq>
      <Footer></Footer>
    </>
  );
}
