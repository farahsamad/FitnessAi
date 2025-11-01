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
import { useEffect, useRef, useState } from "react";
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

  const currentCall = useRef<any>(null);
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
      currentCall.current = null;
    };

    const onVolumeLevel = (volume: number) => {
      setAudioLevel(volume);
    };

    const onMessageUpdate = (message: Message) => {
      // console.log("message", message);
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

          // Check if assistant signals the call is done
          if (message.transcript.includes("Call completed.")) {
            console.log("Assistant finished the plan, ending call...");
            stop(); // Ends the call
          }
        }
      }
    };

    const onError = (e: any) => {
      setConnecting(false);

      setCallStatus(CALL_STATUS.INACTIVE);
      currentCall.current = null;
      console.error("vapi error: ", e);
    };

    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("call-start", onCallStartHandler);
    vapi.on("call-end", onCallEnd);
    vapi.on("volume-level", onVolumeLevel);
    vapi.on("message", onMessageUpdate);
    vapi.on("error", onError);

    // 'state' is not declared in the VapiEventNames type, cast to any and use a named handler so we can remove it later
    const onState = (state: any) => {
      const vars = state?.conversation?.vars;
      if (vars) {
        console.log("Collected variables:", vars);
      }
    };
    vapi.on("state" as any, onState);

    return () => {
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("call-start", onCallStartHandler);
      vapi.off("call-end", onCallEnd);
      vapi.off("volume-level", onVolumeLevel);
      vapi.off("message", onMessageUpdate);
      vapi.off("error", onError);
      vapi.off("state" as any, onState);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    if (!user) {
      console.error("No user found");
      return;
    }
    setConnecting(true);
    setMessages([]);
    const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "There";
    setCallStatus(CALL_STATUS.LOADING);

    console.log("🚀 Starting Vapi with vars:", {
      username: fullName,
      userId: user?.id,
    });

    try {
      // const response = await vapi.start(
      //   process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, // use default assistant/workflow
      //   {
      //     variableValues: {
      //       username: fullName,
      //       userId: user.id,
      //     },
      //   },
      //   undefined,
      //   process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!
      // );

      const response = await vapi.start(
        process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, // use default assistant/workflow
        {
          variableValues: {
            username: fullName,
            userId: user.id,
          },
        }
      );

      currentCall.current = response;

      console.log("✅ Vapi start response:", response);
    } catch (err) {
      console.error("❌ Error starting Vapi call:", err);
      setConnecting(false);
      setCallStatus(CALL_STATUS.INACTIVE);
    }
  };

  const stop = () => {
    setCallStatus(CALL_STATUS.LOADING);
    vapi.stop();
    currentCall.current = null;
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

  // const muteMic = async () => {
  //   try {
  //     if (currentCall.current) {
  //       await currentCall.current.muteAudio();
  //       console.log("🎙️ Mic muted");
  //     } else {
  //       console.warn("No active call to mute");
  //     }
  //   } catch (err) {
  //     console.error("❌ Error muting mic:", err);
  //   }
  // };

  // const unmuteMic = async () => {
  //   try {
  //     if (currentCall.current) {
  //       await currentCall.current.unmuteAudio();
  //       console.log("🎙️ Mic unmuted");
  //     } else {
  //       console.warn("No active call to unmute");
  //     }
  //   } catch (err) {
  //     console.error("❌ Error unmuting mic:", err);
  //   }
  // };

  // const muteMic = () => {
  //   console.log("muteMic useVapi");
  //   // if (!currentCall.current) return;

  //   const audioTracks = currentCall.current.localStream?.getAudioTracks();
  //   console.log("audioTracks: ", audioTracks);
  //   if (audioTracks?.length) {
  //     audioTracks.forEach((track: MediaStreamTrack) => (track.enabled = false));
  //     console.log("🎙️ Mic muted");
  //   }
  // };

  // const unmuteMic = () => {
  //   console.log("unmuteMic useVapi");

  //   // if (!currentCall.current) return;

  //   const audioTracks = currentCall.current.localStream?.getAudioTracks();
  //   console.log("audioTracks: ", audioTracks);

  //   if (audioTracks?.length) {
  //     audioTracks.forEach((track: MediaStreamTrack) => (track.enabled = true));
  //     console.log("🎙️ Mic unmuted");
  //   }
  // };

  const muteMic = () => {
    if (currentCall.current) {
      vapi.setMuted(true);
      // This mutes the audio track that Vapi is sending
      currentCall.current.localAudioTrack.enabled = false;
      console.log("Mic muted");
    }
  };

  const unmuteMic = () => {
    if (currentCall.current) {
      vapi.setMuted(false);

      currentCall.current.localAudioTrack.enabled = true;
      console.log("Mic unmuted");
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
    muteMic,
    unmuteMic,
  };
}
