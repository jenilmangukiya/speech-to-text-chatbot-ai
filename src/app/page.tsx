"use client";

import { Mic, MicOff, Send, Sun, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import useHome from "./useHome";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-4 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 shadow-xl bg-slate-800/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Voice-Enabled AI Chat
            </h1>

            {mounted && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setTheme((theme) =>
                          theme === "dark" ? "light" : "dark"
                        )
                      }
                      className="rounded-full h-10 w-10 text-slate-300 hover:text-yellow-400 hover:bg-slate-700/50"
                    >
                      <Sun className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle theme</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <ScrollArea className="h-[500px] mb-6 p-4 rounded-lg border border-slate-700 bg-slate-800/30 dark:bg-slate-950/50 shadow-inner">
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500">
                  <div className="h-16 w-16 mb-4 rounded-full bg-slate-800/70 flex items-center justify-center">
                    <Bot className="h-8 w-8 text-blue-400/70" />
                  </div>
                  <p className="text-lg font-medium text-slate-400">
                    Start a conversation
                  </p>
                  <p className="text-sm mt-2">
                    Use the microphone button or type your message below
                  </p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-center h-9 w-9 rounded-full ${
                      message.role === "assistant"
                        ? "bg-gradient-to-br from-blue-600 to-purple-700 shadow-md shadow-blue-900/20"
                        : "bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-md shadow-emerald-900/20"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-5 w-5 text-white" />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>

                  <div
                    className={`relative px-4 py-3 rounded-2xl max-w-[80%] ${
                      message.role === "assistant"
                        ? "bg-slate-800 dark:bg-slate-800/80 shadow-lg shadow-slate-900/10"
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-900/10"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <span
                      className={`absolute bottom-[12px] ${
                        message.role === "assistant" ? "-left-2" : "-right-2"
                      } h-4 w-4 transform ${
                        message.role === "assistant"
                          ? "bg-slate-800 dark:bg-slate-800/80"
                          : "bg-cyan-600"
                      } rotate-45`}
                    ></span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message or click the mic to speak..."
                  className="pr-12 py-6 bg-slate-800/50 dark:bg-slate-800/30 border-slate-700 rounded-full text-slate-200 placeholder:text-slate-500"
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 p-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-md disabled:opacity-50"
                  title="Send message"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      onClick={toggleListening}
                      variant={isListening ? "destructive" : "outline"}
                      className={`h-11 w-11 rounded-full shadow-md ${
                        isListening
                          ? "bg-red-500 hover:bg-red-600 border-red-600"
                          : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                      }`}
                      title={isListening ? "Stop listening" : "Start listening"}
                    >
                      {isListening ? (
                        <MicOff className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5 text-blue-400" />
                      )}

                      {isListening && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full">
                          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping"></span>
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isListening ? "Stop" : "Start"} voice input</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {isLoading && (
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-8">
                <div className="flex space-x-2 items-center px-4 py-1 rounded-full bg-slate-800/80 text-sm text-slate-300 shadow-lg">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div
                      className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  <span>AI thinking</span>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
