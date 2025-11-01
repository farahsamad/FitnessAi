"use client";

import { Button } from "@/components/ui/button";
import { CALL_STATUS, useVapi } from "@/hooks/useVapi";
import { useUser } from "@clerk/nextjs";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

const GeneratePlanPage = () => {
  const [isCallStarted, setIsCallStarted] = useState<boolean>(false);
  const [isMicrophoneTurned, setIsMicrophoneTurned] = useState<boolean>(false);

  const { user } = useUser();
  const { isSpeechActive, callStatus, messages, connecting, toggleCall, muteMic, unmuteMic } =
    useVapi();
  console.log("callStatus: ", callStatus);

  // console.log("messages////////////////////////: ", messages);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      console.log(
        "////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////messageContainerRef.current: ",
        messageContainerRef.current.scrollHeight
      );
    }
    console.log("//////////messageContainerRef.current");
  }, [messages]);

  const handleCall = () => {
    setIsCallStarted((prev) => !prev);
    toggleCall();
    console.log("isCallStarted: ", isCallStarted);
  };

  // const handleMicrophone = () => {
  //   setIsMicrophoneTurned((prev) => {
  //     const newState = !prev;
  //     if (newState) {
  //       unmuteMic();
  //     } else {
  //       muteMic();
  //     }
  //     return newState;
  //   });
  // };

  const handleMicrophone = () => {
    if (isMicrophoneTurned) {
      unmuteMic();
    } else {
      muteMic();
    }
    setIsMicrophoneTurned((prev) => !prev);
  };

  return (
    <div className="w-full h-full min-h-[calc(100svh-96px)] flex flex-col items-center ">
      <h1 className="text-2xl font-bold mt-4">Generate your plan</h1>
      {/* <div className="flex justify-evenly w-full py-6 px-4"> */}
      <div className="flex flex-col items-center md:flex-row md:justify-evenly w-full py-6 px-4 gap-4">
        <div className="border-blue-900 border-[1px]  min-w-[200px] w-[80%] sm:w-[400px] md:min-w-[300px] md:w-[300px] lg:min-w-[450px] lg:w-[450px]  h-[300px] min-h-[300px] lg:h-[350px] bg-gray-950 rounded-md flex justify-center items-center flex-col">
          {/* <div
            className={`absolute inset-0 bg-primary opacity-10 rounded-full blur-lg ${
              callStatus === CALL_STATUS.ACTIVE ? "animate-pulse" : ""
            }`}
          /> */}

          {/* image */}
          <div className="w-fit h-fit relative ">
            {isSpeechActive && (
              <>
                <span className="absolute inset-0 opacity-10 w-full h-full rounded-full blur-lg animate-ping1  bg-blue-500/30"></span>
                <span className="absolute inset-0 opacity-10 w-full h-full rounded-full blur-lg animate-ping2 bg-blue-500/20"></span>
                <span className="absolute inset-0 opacity-10 w-full h-full rounded-full blur-lg animate-ping3 bg-blue-500/10"></span>
              </>
            )}

            <div
              className={`rounded-full shadow-xl w-[150px] h-[150px] ${
                isSpeechActive ? "" : "bg-blue-950"
              }`}
            >
              <div className=" flex flex-row gap-x-2 items-center justify-center">
                {[...Array(7)].map((value, index) => (
                  <div
                    key={index}
                    className={`wave rounded-full w-2  bg-blue-600/60`}
                    style={{
                      animationDelay: `${index * 0.2}s`,
                      height: isSpeechActive ? `${Math.floor(Math.random() * 100) + 20}px` : "0px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <h3>FitnessAi</h3>
        </div>
        <div className="border-blue-900 border-[1px] min-w-[200px] w-[200px] md:min-w-[300px] md:w-[300px] lg:min-w-[450px] lg:w-[450px]  h-[300px] min-h-[300px] lg:h-[350px]  bg-gray-950 rounded-md hidden md:block">
          <div className="w-full h-full flex justify-center items-center flex-col">
            {/* <div className="rounded-full w-10 h-10"></div> */}
            <Image
              src={user ? user.imageUrl : "/public/file.svg"}
              alt="user image"
              width={150}
              height={150}
              className="rounded-full w-[150px] h-[150px] shadow-xl"
            />
            <h3>{user?.firstName}</h3>
          </div>
        </div>
      </div>
      <div className="w-full min-w-fit flex justify-center">
        {callStatus === CALL_STATUS.LOADING ? (
          <div className={"flex flex-col items-center gap-4"}>
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">Calling...</p>
          </div>
        ) : callStatus === CALL_STATUS.ACTIVE ? (
          <Button
            size="lg"
            asChild
            className=" bg-red-700 text-white px-8 py-6 text-lg font-medium hover:bg-red-800 !rounded-full"
            onClick={() => handleCall()}
            disabled={connecting}
          >
            <div className="flex items-center font-mono cursor-pointer">
              <PhoneOff className="cursor-pointer " />
            </div>
          </Button>
        ) : (
          <Button
            size="lg"
            asChild
            className=" bg-green-700 text-white px-8 py-6 text-lg font-medium hover:bg-gray-950 !rounded-lg"
            onClick={() => handleCall()}
            disabled={connecting}
          >
            <div className="flex items-center font-mono cursor-pointer">
              <Phone className="cursor-pointer" />
            </div>
          </Button>
        )}

        {isMicrophoneTurned ? (
          <Button
            size="lg"
            asChild
            className=" bg-blue-950 text-white px-8 py-6 text-lg font-medium hover:bg-gray-950 ml-4 !rounded-lg"
            onClick={() => handleMicrophone()}
          >
            <div className="flex items-center font-mono cursor-pointer">
              <Mic className="cursor-pointer" />
            </div>
          </Button>
        ) : (
          <Button
            size="lg"
            asChild
            className=" bg-red-700 text-white px-8 py-6 text-lg font-medium hover:bg-red-800 ml-4 !rounded-full"
            onClick={() => handleMicrophone()}
          >
            <div className="flex items-center font-mono cursor-pointer">
              <MicOff className="cursor-pointer " />
            </div>
          </Button>
        )}
      </div>
      {callStatus === CALL_STATUS.ACTIVE && messages.length > 0 && (
        <div className="w-full h-52 my-6">
          <div
            className="h-full mx-auto w-3/4  border-[1px] border-gray-900 shadow-lg  py-2 px-4  bg-card/90 backdrop-blur-sm  rounded-xl p-4 mb-8 overflow-y-auto transition-all duration-300 scroll-smooth"
            ref={messageContainerRef}
          >
            {/* <div className="inline-flex h-7 w-full ">
              <h3>User:</h3>
              <h3 className="ml-3">Hello</h3>
            </div> */}
            <div className="flex flex-col space-y-2 ">
              {messages.map((message, index) => (
                <div key={`message-${index}`} className="animate-fadeIn inline-flex ">
                  <span className="font-semibold  text-gray-400">
                    {message.role === "assistant" ? "FitnessAi" : "You"}:
                  </span>
                  <span className="ml-4">{message.content}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratePlanPage;
