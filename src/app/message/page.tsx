"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { AudioLines, Link } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface IMessage {
  sender: "user" | "FitnessAi";
  text: string;
}

interface IUserData {
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  injuries?: string;
  workout_days?: string;
  fitness_goal?: string;
  fitness_level?: string;
  dietary_restrictions?: string;
  userId?: string;
}

const MessagePage = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [userData, setUserData] = useState<IUserData>({});
  const { user } = useUser();
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const startChat = async () => {
      const res = await fetch("/api/genAi/collect-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          userData: userData,
        }),
      });
      const data = await res.json();
      const FitnessAiText = JSON.parse(data.text);
      console.log("FitnessAi data: ", data);
      console.log("FitnessAi data.text: ", data.text);
      console.log("FitnessAi text.response: ", FitnessAiText.response);

      setMessages([{ sender: "FitnessAi", text: FitnessAiText.response }]);
    };

    startChat();
  }, []);

  //   const sendMessage = async () => {
  //     if (!input.trim()) return;

  //     const userMessage: IMessage = { sender: "user", text: input };
  //     setMessages((prev) => [...prev, userMessage]);
  //     setInput("");

  //     // Simulate bot response (you can connect to API here)
  //     const botMessage: IMessage = {
  //       sender: "bot",
  //       text: `You said: "${input}"`,
  //     };

  //     setTimeout(() => {
  //       setMessages((prev) => [...prev, botMessage]);
  //     }, 500);
  //     };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    // Try to update userData based on last bot question
    const lastBotMessage = messages
      .filter((m) => m.sender === "FitnessAi")
      .at(-1)
      ?.text.toLowerCase();
    const updated = { ...userData };
    updated.userId = user?.id;
    if (lastBotMessage?.includes("your age")) updated.age = input;
    else if (lastBotMessage?.includes("gender")) updated.gender = input;
    else if (lastBotMessage?.includes("height")) updated.height = input;
    else if (lastBotMessage?.includes("weight")) updated.weight = input;
    else if (lastBotMessage?.includes("injuries")) updated.injuries = input;
    else if (lastBotMessage?.includes("days")) updated.workout_days = input;
    else if (lastBotMessage?.includes("goal")) updated.fitness_goal = input;
    else if (lastBotMessage?.includes("level")) updated.fitness_level = input;
    else if (lastBotMessage?.includes("dietary")) updated.dietary_restrictions = input;

    setUserData(updated);

    console.log("userData: ", userData);

    const res = await fetch("/api/genAi/collect-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input,
        userData: updated,
      }),
    });

    const data = await res.json();
    const FitnessAiText = JSON.parse(data.text);
    console.log("data.text: ", data.text);
    console.log("FitnessAiText.question: ", FitnessAiText.question);
    setMessages((prev) => [
      ...prev,
      { sender: "FitnessAi", text: FitnessAiText.question || FitnessAiText.next_question },
    ]);
    setInput("");
    if (data.text.includes("Thanks! I now have all I need to generate your plan.")) {
      console.log("userData after: ", userData);
      console.log(
        "JSON.stringify userData after : ",
        JSON.stringify({
          userData,
        })
      );
      const res = await fetch("/api/genAi/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const plansRes = await res.json();
      if (plansRes.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "FitnessAi",
            text: "Plan generated. You will be redirected to your profile page",
          },
        ]);

        setTimeout(() => {
          router.push("/profile");
        }, 1000);
      }
      console.log("PlanRes: ", plansRes);
    }
  };

  return (
    <div className="flex  w-full max-h-[calc(100svh-176px)] h-[calc(100svh-176px)] bg-gray-800 relative overflow-hidden">
      <div
        id="message-container"
        className="flex-1  h-full overflow-y-auto p-4 space-y-4 w-full mb-20"
        ref={messageContainerRef}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`w-full h-fit flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-lg px-4 py-2 rounded-2xl text-white ${
                msg.sender === "user" ? "bg-gray-600" : "bg-gray-950 "
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 w-full p-4 h-20 border-t bg-gray-900 flex items-center gap-2">
        <input
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-800"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        {input.length > 0 ? (
          <button
            onClick={sendMessage}
            className="bg-blue-900 text-white px-4 py-2 rounded-full hover:bg-blue-800"
          >
            Send
          </button>
        ) : (
          <Button
            size="lg"
            asChild
            className=" bg-blue-900 text-white px-8 py-6 text-lg font-medium hover:bg-blue-950"
          >
            <Link href={"/generate-plan"} className="flex items-center font-mono">
              <AudioLines className="ml-2 size-5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessagePage;
