import Image from "next/image";

import {
  Carousel,
  CarouselPrevious,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

export function Testimonials() {
  return (
    <section className="container flex flex-col items-center gap-6 py-24 sm:gap-7">
      <div className="flex flex-col gap-3">
        <span className="font-bold uppercase text-primary text-center">Testimonials</span>
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl text-balance text-center">
          What our users say
        </h2>
      </div>
      <p className="text-lg text-muted-foreground text-balance max-w-lg text-center">
        What developers and founders of top companies around the internet are saying about Reweb.
      </p>
      <Carousel opts={{ loop: true, align: "start" }} className="mt-6 w-full px-4 xl:px-0">
        <CarouselPrevious className="-left-6 size-7 xl:-left-12 xl:size-8" />
        <CarouselContent className="pb-4">
          <CarouselItem className="md:basis-1/2 lg:basis-1/3">
            <div className="h-full p-1">
              <Card className="h-full shadow-md">
                <CardContent className="flex flex-col items-start gap-5 p-7">
                  <div className="flex items-center gap-4">
                    <div className="relative size-10">
                      <Image
                        alt="Picture"
                        src="/images/testimonial-1.avif"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold leading-none text-foreground">John</p>
                      <p className="mt-1 leading-none text-muted-foreground">@johndoe</p>
                    </div>
                  </div>
                  <p className="text-foreground">
                    &quot;Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec
                    ultrices orci. Vivamus ante arcu, hendrerit bibendum felis a, volutpat feugiat
                    tellus. Aliquam erat volutpat.&quot;
                  </p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
          <CarouselItem className="md:basis-1/2 lg:basis-1/3">
            <div className="h-full p-1">
              <Card className="h-full shadow-md">
                <CardContent className="flex flex-col items-start gap-5 p-7">
                  <div className="flex items-center gap-4">
                    <div className="relative size-10">
                      <Image
                        alt="Picture"
                        src="/images/testimonial-2.avif"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold leading-none text-foreground">Max</p>
                      <p className="mt-1 leading-none text-muted-foreground">@maxcook</p>
                    </div>
                  </div>
                  <p className="text-foreground">
                    &quot;Mauris tincidunt porttitor risus, et posuere erat malesuada eu. Praesent
                    volutpat ut ipsum ac congue. Vestibulum nec orci ornare, imperdiet metus
                    vel.&quot;
                  </p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
          <CarouselItem className="md:basis-1/2 lg:basis-1/3">
            <div className="h-full p-1">
              <Card className="h-full shadow-md">
                <CardContent className="flex flex-col items-start gap-5 p-7">
                  <div className="flex items-center gap-4">
                    <div className="relative size-10">
                      <Image
                        alt="Picture"
                        src="/images/testimonial-3.avif"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold leading-none text-foreground">Bob</p>
                      <p className="mt-1 leading-none text-muted-foreground">@thisisbob</p>
                    </div>
                  </div>
                  <p className="text-foreground">
                    &quot;Curabitur at quam eget eros semper euismod vitae at neque. Ut ultrices ut
                    tortor et feugiat. Etiam vitae nisi eleifend, blandit ligula quis, sodales
                    neque.&quot;
                  </p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
          <CarouselItem className="md:basis-1/2 lg:basis-1/3">
            <div className="h-full p-1">
              <Card className="h-full shadow-md">
                <CardContent className="flex flex-col items-start gap-5 p-7">
                  <div className="flex items-center gap-4">
                    <div className="relative size-10">
                      <Image
                        alt="Picture"
                        src="/images/testimonial-4.avif"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold leading-none text-foreground">Emily</p>
                      <p className="mt-1 leading-none text-muted-foreground">@emilysmith</p>
                    </div>
                  </div>
                  <p className="text-foreground">
                    &quot;Suspendisse a velit elit. Curabitur augue libero, vulputate sed dui id,
                    sodales venenatis sem. Suspendisse dapibus neque eu justo volutpat
                    gravida.&quot;
                  </p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
          <CarouselItem className="md:basis-1/2 lg:basis-1/3">
            <div className="h-full p-1">
              <Card className="h-full shadow-md">
                <CardContent className="flex flex-col items-start gap-5 p-7">
                  <div className="flex items-center gap-4">
                    <div className="relative size-10">
                      <Image
                        alt="Picture"
                        src="/images/testimonial-5.avif"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold leading-none text-foreground">Micheal</p>
                      <p className="mt-1 leading-none text-muted-foreground">@michael</p>
                    </div>
                  </div>
                  <p className="text-foreground">
                    &quot;Vivamus dignissim porta orci, finibus tempus risus consectetur dapibus.
                    Donec quis ornare elit. Curabitur tempor eget urna eget lobortis dolor
                    varius.&quot;
                  </p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
          <CarouselItem className="md:basis-1/2 lg:basis-1/3">
            <div className="h-full p-1">
              <Card className="h-full shadow-md">
                <CardContent className="flex flex-col items-start gap-5 p-7">
                  <div className="flex items-center gap-4">
                    <div className="relative size-10">
                      <Image
                        alt="Picture"
                        src="/images/testimonial-6.avif"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold leading-none text-foreground">Linda</p>
                      <p className="mt-1 leading-none text-muted-foreground">@thisislinda</p>
                    </div>
                  </div>
                  <p className="text-foreground">
                    &quot;Nullam non lorem vitae risus volutpat dictum non sed magna. Aliquam in
                    venenatis quam. Morbi feugiat tristique leo, vel ultrices dolor varius non.
                    Quisque dictum tortor eu nunc.&quot;
                  </p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselNext className="-right-6 size-7 xl:-right-12 xl:size-8" />
      </Carousel>
    </section>
  );
}
