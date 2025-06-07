"use client";

import AutoScroll from "embla-carousel-auto-scroll";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import Coca from "@/public/coca-cola-logo-svgrepo-com.svg";
import Instagram from "@/public/instagram-2-1-logo-svgrepo-com.svg";
import Whatsapp from "@/public/whatsapp-icon-logo-svgrepo-com.svg";
import Youtube from "@/public/youtube-icon-logo-svgrepo-com.svg";
import ManCity from "@/public/Logo_Manchester_City_2016.svg";
import Snapchat from "@/public/snapchat-logo-svgrepo-com.svg"
import Paypal from "@/public/paypal-icon-logo-svgrepo-com.svg"
import BMW from "@/public/bmw-logo-svgrepo-com.svg"

interface Logo {
  id: string;
  description: string;
  image: string;
  className?: string;
}

interface Logos3Props {
  heading?: string;
  logos?: Logo[];
  className?: string;
}

const CarouselComposant = ({
  heading = "Ces marques nous font confiance",
  logos = [
    {
      id: "logo-1",
      description: "Logo 1",
      image: Coca,
      className: "h-30 w-auto",
    },
    {
      id: "logo-2",
      description: "Logo 2",
      image: Instagram,
      className: "h-15 w-auto",
    },
    {
      id: "logo-3",
      description: "Logo 3",
      image: ManCity,
      className: "h-20 w-auto",
    },
    {
      id: "logo-4",
      description: "Logo 4",
      image: Whatsapp,
      className: "h-15 w-auto",
    },
    {
      id: "logo-5",
      description: "Logo 5",
      image: Youtube,
      className: "h-20 w-auto",
    },
    {
      id: "logo-6",
      description: "Logo 6",
      image: BMW,
      className: "h-15 w-auto",
    },
    {
      id: "logo-7",
      description: "Logo 7",
      image: Paypal,
      className: "h-15 w-auto",
    },
    {
      id: "logo-8",
      description: "Logo 8",
      image: Snapchat,
      className: "h-15 w-auto",
    },
  ],
}: Logos3Props) => {
  return (
    <section className="py-32">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center max-w-4xl">
        <h1 className="my-6 text-pretty text-2xl font-bold lg:text-4xl">
          {heading}
        </h1>
      </div>
      <div className="pt-10 md:pt-16 lg:pt-20">
        <div className="relative mx-auto flex items-center justify-center lg:max-w-5xl overflow-x-hidden">
          <Carousel
            opts={{ loop: true }}
            plugins={[AutoScroll({ playOnInit: true })]}
          >
            <CarouselContent className="!ml-0">
              {logos.map((logo) => (
                <CarouselItem
                  key={logo.id}
                  className="flex basis-1/3 justify-center !pl-0 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                >
                  <div className="mx-10 flex shrink-0 items-center justify-center">
                    <div>
                      <Image
                        src={logo.image}
                        alt={logo.description}
                        width={40}
                        height={40}
                        className={logo.className}
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export { CarouselComposant };
