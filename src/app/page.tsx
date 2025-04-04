"use client";

import { useChat } from "@ai-sdk/react";
import { Mic, MicOff, Send } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechRef = useRef<number>(Date.now());

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (transcript) {
      handleInputChange({
        target: { value: transcript },
      } as React.ChangeEvent<HTMLTextAreaElement>);
      // Update last speech timestamp when transcript changes
      lastSpeechRef.current = Date.now();
    }
  }, [transcript, handleInputChange]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
      }
      stopListening();
    };
  }, []);

  const toggleListening = () => {
    if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  const startListening = () => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        lastSpeechRef.current = Date.now();

        // Start silence detection - check every second if user has stopped speaking
        silenceTimerRef.current = setInterval(() => {
          const timeSinceLastSpeech = Date.now() - lastSpeechRef.current;
          // If no speech detected for 2 seconds, stop listening
          if (timeSinceLastSpeech > 2000) {
            stopListening();
          }
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");
        setTranscript(transcript);
        // Update last speech timestamp
        lastSpeechRef.current = Date.now();
      };

      recognition.onerror = (event: any) => {
        console.error(event.error);
        setIsListening(false);
        if (silenceTimerRef.current) {
          clearInterval(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) {
          clearInterval(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
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

    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // Manual input handler
  const onManualInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    // Clear transcript when manually typing
    if (e.target.value !== transcript) {
      setTranscript("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 shadow-xl">
          <h1 className="text-2xl font-bold text-center mb-6">
            Voice-Enabled AI Chat
          </h1>

          <ScrollArea className="h-[500px] mb-4 p-4 rounded-lg border">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 p-4 rounded-lg ${
                    message.role !== "assistant"
                      ? "bg-primary text-primary-foreground ml-4"
                      : "bg-muted mr-4"
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              ))}
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={onManualInputChange}
                placeholder="Type your message or click the mic to speak..."
                className="flex-1"
                rows={3}
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={toggleListening}
                  variant={isListening ? "destructive" : "secondary"}
                  className="h-12 w-12 p-2"
                  title={isListening ? "Stop listening" : "Start listening"}
                >
                  {isListening ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  type="submit"
                  className="h-12 w-12 p-2"
                  title="Send message"
                >
                  <Send className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
