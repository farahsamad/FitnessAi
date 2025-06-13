"use client";

import {
  Message,
  MessageRoleEnum,
  MessageTypeEnum,
  TranscriptMessage,
  TranscriptMessageTypeEnum,
} from "@/lib/types";
import { vapi } from "@/lib/vapi";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
// import { MessageActionTypeEnum, useMessages } from "./useMessages";

export enum CALL_STATUS {
  INACTIVE = "inactive",
  ACTIVE = "active",
  LOADING = "loading",
}

export interface INewMessage {
  content: string;
  role: MessageRoleEnum;
}

export function useVapi() {
  const { user } = useUser();
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<CALL_STATUS>(CALL_STATUS.INACTIVE);

  const [messages, setMessages] = useState<INewMessage[]>([]);

  const [activeTranscript, setActiveTranscript] = useState<TranscriptMessage | null>(null);

  const [audioLevel, setAudioLevel] = useState(0);

  //   useEffect(() => {
  //     const originalError = console.error;
  //     // override console.error to ignore "Meeting has ended" errors
  //     console.error = function (msg, ...args) {
  //       if (
  //         msg &&
  //         (msg.includes("Meeting has ended") ||
  //           (args[0] && args[0].toString().includes("Meeting has ended")))
  //       ) {
  //         console.log("Ignoring known error: Meeting has ended");
  //         return; // don't pass to original handler
  //       }

  //       // pass all other errors to the original handler
  //       return originalError.call(console, msg, ...args);
  //     };

  //     // restore original handler on unmount
  //     return () => {
  //       console.error = originalError;
  //     };
  //   }, []);

  useEffect(() => {
    const onSpeechStart = () => setIsSpeechActive(true);
    const onSpeechEnd = () => {
      console.log("Speech has ended");
      setIsSpeechActive(false);
    };

    const onCallStartHandler = () => {
      console.log("Call has started");
      setConnecting(false);
      setCallStatus(CALL_STATUS.ACTIVE);
    };

    const onCallEnd = () => {
      console.log("Call has stopped");
      setConnecting(false);

      setCallStatus(CALL_STATUS.INACTIVE);
    };

    const onVolumeLevel = (volume: number) => {
      setAudioLevel(volume);
    };

    const onMessageUpdate = (message: Message) => {
      console.log("message", message);
      if (
        message.type === MessageTypeEnum.TRANSCRIPT &&
        message.transcriptType === TranscriptMessageTypeEnum.PARTIAL
      ) {
        setActiveTranscript(message);
      } else {
        if (
          message.type === MessageTypeEnum.TRANSCRIPT &&
          message.transcriptType === TranscriptMessageTypeEnum.FINAL
        ) {
          const newMessage = { content: message.transcript, role: message.role };
          setMessages((prev) => [...prev, newMessage]);
          setActiveTranscript(null);
        }
      }
    };

    const onError = (e: any) => {
      setConnecting(false);

      setCallStatus(CALL_STATUS.INACTIVE);
      console.error("vapi error: ", e);
    };

    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("call-start", onCallStartHandler);
    vapi.on("call-end", onCallEnd);
    vapi.on("volume-level", onVolumeLevel);
    vapi.on("message", onMessageUpdate);
    vapi.on("error", onError);

    return () => {
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("call-start", onCallStartHandler);
      vapi.off("call-end", onCallEnd);
      vapi.off("volume-level", onVolumeLevel);
      vapi.off("message", onMessageUpdate);
      vapi.off("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    setConnecting(true);
    setMessages([]);
    const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "There";

    console.log("Assistant ID:", process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID);
    console.log("Workflow ID:", process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID);
    setCallStatus(CALL_STATUS.LOADING);
    const response = await vapi.start(
      undefined,
      {
        variableValues: {
          username: fullName,
          userId: user?.id,
        },
      },
      undefined,
      process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!
    );

    console.log("call", response);
  };

  const stop = () => {
    setCallStatus(CALL_STATUS.LOADING);
    vapi.stop();
  };

  const toggleCall = () => {
    if (callStatus == CALL_STATUS.ACTIVE) {
      stop();
    } else {
      try {
        start();
      } catch (error) {
        console.log(error);
        setConnecting(false);

        setCallStatus(CALL_STATUS.INACTIVE);
      }
    }
  };

  return {
    isSpeechActive,
    callStatus,
    audioLevel,
    activeTranscript,
    messages,
    connecting,
    start,
    stop,
    toggleCall,
  };
}
