"use client";

import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import useHome from "./useHome";

export default function Home() {
  const {
    isListening,
    input,
    messages,
    isLoading,
    handleSubmit,
    toggleListening,
    onManualInputChange,
    messagesEndRef,
  } = useHome();

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
                disabled={isLoading}
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
                  disabled={isLoading}
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
