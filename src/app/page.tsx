"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon, MessageCircleIcon, Quote, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

interface ITestimony {
  testimony: string;
  writer: string;
}

const HomePage = () => {
  const [testimonyIndex, setTestimonyIndex] = useState<number>(0);
  const testimonials: ITestimony[] = [
    {
      testimony:
        "I've struggled for years to find a fitness and diet plan that actually fits my busy lifestyle. This AI-powered platform completely changed that. The plans are tailored exactly to my goals and preferences, making it easy to stay motivated and consistent. It feels like having a personal coach available anytime I need. Highly recommend for anyone serious about results!",
      writer: "Sarah M.",
    },
    {
      testimony:
        "After trying countless workout routines and diet plans with little success, this AI-driven service was a game-changer. The level of personalization blew me away — every workout and meal feels designed just for me. The progress I've made in just a few months is amazing, and I love how the AI adapts as I improve. It's perfect for anyone who wants smart, effective guidance without the guesswork.",
      writer: "James T.",
    },
    {
      testimony:
        "What I love most about this platform is how the AI seamlessly combines fitness and nutrition into one easy-to-follow plan. It's like having a personal trainer and dietitian in my pocket 24/7. The recommendations are practical, effective, and truly sustainable, which helped me build habits that stick. I'm more confident and energized than ever before, thanks to this amazing tool.",
      writer: "Emily R.",
    },
  ];

  const previousTestimony = () => {
    if (testimonyIndex === 0) {
      setTestimonyIndex(testimonials.length - 1);
    }
    if (testimonyIndex > 0) {
      setTestimonyIndex((prev) => prev - 1);
    }
  };
  const nextTestimony = () => {
    if (testimonyIndex < testimonials.length - 1) {
      setTestimonyIndex((prev) => prev + 1);
    }
    if (testimonyIndex === testimonials.length - 1) {
      setTestimonyIndex(0);
    }
  };

  return (
    <div className="w-full h-full ">
      <div
        className="w-full min-h-[600px] h-[calc(100svh-96px)] max-h-[1000px]
  grid place-content-center grid-cols-1 md:grid-cols-12  px-7 relative bg-[url(/images/FitnessAi.jpg)]  bg-cover bg-center bg-no-repeat md:bg-none rounded-md mb-28"
      >
        <div className="md:col-span-7 col-span-1 h-full md:h-[80%] ju flex flex-col items-center md:items-baseline md:mt-[10%] ">
          <div className="w-full">
            <h1 className="uppercase text-3xl lg:text-6xl  font-bold tracking-tight text-nowrap">
              <div>Crush</div>
              <div className="text-blue-900 mt-4">your goals</div>
              <div className="mt-4">with AI crafted</div>
              <div className="text-blue-900 mt-4">plans</div>
            </h1>
          </div>
          <div className="w-full">
            <h4 className="text-gray-500 text-lg max-w-[85%] md:max-w-[65%] text-justify pt-4">
              AI-powered platform creates customized workout and diet plans tailored to individual
              goals, fitness level, and lifestyle.
            </h4>
          </div>

          <div className="w-full min-w-fit pt-6">
            <Button
              size="lg"
              asChild
              className=" bg-blue-900 text-white px-8 py-6 text-lg font-medium hover:bg-blue-950"
            >
              <Link href={"/generate-plan"} className="flex items-center font-mono">
                Generate Your Plan
                <Sparkles className="ml-2 size-5" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="md:col-span-5 hidden md:block md:h-[80%] h-full md:mt-[10%]">
          <Image
            src={"/images/FitnessAi.jpg"}
            alt="fitnessAi image"
            width={500}
            height={500}
            className="md:w-full md:h-full object-cover rounded-md"
          />
        </div>

        <div className="absolute bottom-0 left-0 h-12 w-12 border-l-2 border-b-2 border-blue-800"></div>
        <div className="absolute bottom-0 right-0 h-12 w-12 border-r-2 border-b-2 border-blue-800"></div>
      </div>

      <div className=" py-12 bg-blue-950 my-14 w-full h-80 min-h-fit">
        <div className="max-w-6xl mx-auto bg-gray-900  text-white rounded-md shadow-2xl w-3/4 px-4 py-9 border-[1px] border-blue-500">
          <div className="text-lg text-center py-4">
            Advanced AI delivers smart, effective plans tailored for real results.
          </div>
          <div className="  md:divide-y-0 md:divide-x md:divide-gray-300 text-center w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 py-4">
            <div className="py-6 px-4">
              <h3 className="text-4xl font-bold ">1K+</h3>
              <p className=" mt-2">Plans Generated</p>
            </div>

            <div className="py-6 px-4">
              <h3 className="text-4xl font-bold ">95%</h3>
              <p className=" mt-2">User Satisfaction</p>
            </div>

            <div className="py-6 px-4">
              <h3 className="text-4xl font-bold ">50+</h3>
              <p className=" mt-2">Fitness Goals Covered</p>
            </div>

            <div className="py-6 px-4">
              <h3 className="text-4xl font-bold ">24/7</h3>
              <p className=" mt-2">AI Support Availability</p>
            </div>
          </div>
        </div>
      </div>
      <div className=" py-12 w-full h-96 my-14 min-h-fit">
        <div className=" bg-gray-950 text-white rounded-md shadow-2xl px-4 py-9 border-[1px] border-gray-900">
          <div className="text-xl py-4">Testimonials</div>
          <div className="mt-4 inline-flex relative h-fit">
            <span className="text-xl">
              <Quote className="w-5 h-5 text-gray-900 rotate-180" />
              {/* <Quote className="w-12 h-12 text-gray-900 ml-2 " /> */}
            </span>
            <span className="mx-2 text-justify min-h-24">
              {testimonials[testimonyIndex].testimony}
            </span>
            <span className="text-xl absolute bottom-0 right-0">
              <Quote className="w-5 h-5 text-gray-900" />
            </span>
          </div>
          <div className="relative mt-4 h-[30px]">
            <div className="h-full flex items-center">{testimonials[testimonyIndex].writer}</div>
            <div className="absolute flex top-0 right-10 space-x-2">
              <ArrowLeftIcon
                onClick={() => previousTestimony()}
                className="py-1 px-1 border-2 cursor-pointer rounded-full w-[30px] h-[30px] hover:bg-gray-200 hover:text-blue-900"
              />
              <ArrowRightIcon
                onClick={() => nextTestimony()}
                className="py-1 px-1 border-2 cursor-pointer rounded-full w-[30px] h-[30px] hover:bg-gray-200 hover:text-blue-900"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-3 w-11 h-11 bg-black rounded-full shadow-lg grid place-content-center">
        <Link href={"/message"} className="cursor-pointer">
          <MessageCircleIcon />
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
