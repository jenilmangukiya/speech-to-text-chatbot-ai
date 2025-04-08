import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const useHome = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSpeechRef = useRef<number>(Date.now());
  const ref = useRef("");

  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Set dark theme as default and handle hydration
  useEffect(() => {
    setMounted(true);
    setTheme("dark");
  }, [setTheme]);

  // Ensure input is always on one line by replacing newline characters
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\n/g, " ");
    const event = { ...e, target: { ...e.target, value } };
    onManualInputChange(event as any);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // Handle clicking on example prompt
  const handleExamplePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      // Remove newlines from transcript
      setInput(transcript.replace(/\n/g, " "));
      ref.current = transcript.replace(/\n/g, " ");
      lastSpeechRef.current = Date.now();
    }
  }, [transcript]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    // Check for both standard and webkit implementations
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      // Use the appropriate API
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognition();

      // Set to false to automatically stop after silence is detected
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        lastSpeechRef.current = Date.now();
      };

      recognition.onresult = (event: any) => {
        const transcriptt = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("")
          .replace(/\n/g, " "); // Remove any newlines
        setTranscript(transcriptt);
        lastSpeechRef.current = Date.now();
      };

      recognition.onerror = (event: any) => {
        console.error(event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        submitMessage(ref?.current);
      };

      recognition.start();
      (window as any).recognition = recognition;
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const stopListening = () => {
    if ((window as any).recognition) {
      (window as any).recognition.stop();
    }
    setIsListening(false);
    handleSubmit();
  };

  const onManualInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
    if (e.target.value !== transcript) setTranscript("");
  };

  // New helper function to handle submission with a given message
  const submitMessage = async (messageContent: string) => {
    if (!messageContent) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageContent,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    setTranscript("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();

      const reply: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.text || "No response received.",
      };

      setMessages((prev) => [...prev, reply]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "An error occurred. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the original handleSubmit to use the new helper
  const handleSubmit = () => {
    submitMessage(input.trim());
  };

  return {
    isListening,
    input,
    messages,
    isLoading,
    handleSubmit,
    handleKeyDown,
    toggleListening,
    messagesEndRef,
    handleExamplePromptClick,
    handleInputChange,
    mounted,
    setTheme,
  };
};

export default useHome;
