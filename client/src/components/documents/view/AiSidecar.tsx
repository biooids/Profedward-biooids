"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  PlusCircle,
} from "lucide-react";
import { AiAction, SidecarTab } from "./DocumentWorkspace";
import {
  ChatMessage,
  QuizQuestion,
  ConversationHistoryItem as HistoryItemType,
} from "@/lib/ai/aiTypes";
import ConversationHistoryItem from "./ConversationHistoryItem";
import { cn } from "@/lib/utils";

interface AiSidecarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isLoading: boolean;
  selectedText: string;
  onAiAction: (action: AiAction, text?: string) => void;
  className?: string;
  chatHistory: ChatMessage[];
  conversationHistoryList: HistoryItemType[];
  activeConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  activeSidecarTab: SidecarTab;
  onSidecarTabChange: (tab: SidecarTab) => void;
}

export default function AiSidecar({
  isMobileOpen,
  onMobileClose,
  isLoading,
  selectedText,
  onAiAction,
  className,
  chatHistory,
  conversationHistoryList,
  activeConversationId,
  onSelectConversation,
  activeSidecarTab,
  onSidecarTabChange,
}: AiSidecarProps) {
  const [chatInput, setChatInput] = useState("");
  const hasSelection = selectedText.length > 0;
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleSendClick = () => {
    if (!chatInput.trim()) return;
    onAiAction("ask", chatInput);
    setChatInput("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendClick();
    }
  };

  const renderMessageContent = (content: any) => {
    let parsedContent = content;
    if (typeof content === "string") {
      try {
        parsedContent = JSON.parse(content);
      } catch (e) {
        /* Not JSON, so render as string */
      }
    }
    if (Array.isArray(parsedContent) && parsedContent[0]?.question) {
      return (
        <div className="space-y-3">
          {(parsedContent as QuizQuestion[]).map((q, index) => (
            <div
              key={index}
              className="rounded-md border bg-background/50 p-3 not-prose"
            >
              <p className="font-medium">
                {index + 1}. {q.question}
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                {q.options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
              <p className="mt-2 text-muted-foreground text-sm">
                Answer: {q.answer}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-sm whitespace-pre-wrap">{String(content)}</p>;
  };

  return (
    <aside
      className={cn(
        `flex flex-col border-l bg-background transition-transform duration-300 ease-in-out md:w-full md:max-w-md 
        fixed inset-0 z-50 h-full w-full md:relative md:z-auto 
        ${
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        } md:translate-x-0`,
        className
      )}
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">AI Assistant</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        <Tabs
          value={activeSidecarTab}
          onValueChange={(value) => onSidecarTabChange(value as SidecarTab)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <TabsList className="mx-4 mt-4 grid w-auto grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent
            value="chat"
            className="flex-1 flex flex-col overflow-hidden p-4"
          >
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              {chatHistory.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground p-4">
                  <Sparkles className="mx-auto h-8 w-8 mb-2" />
                  <p>
                    Select text or ask a question to begin a new conversation.
                  </p>
                </div>
              )}
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3",
                    msg.role === "human" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "ai" && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[85%]",
                      msg.role === "human"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                  {msg.role === "human" && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="rounded-lg px-3 py-2 bg-muted flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="mt-auto space-y-2 border-t pt-4">
              {hasSelection && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Act on selection:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAiAction("summarize", selectedText)}
                      disabled={isLoading}
                    >
                      Summarize
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAiAction("explain", selectedText)}
                      disabled={isLoading}
                    >
                      Explain
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAiAction("quiz", selectedText)}
                      disabled={isLoading}
                    >
                      Quiz Me
                    </Button>
                  </div>
                </div>
              )}
              <div className="relative">
                <Textarea
                  placeholder="Ask a question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pr-12"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  className="absolute bottom-2 right-2 h-8 w-8"
                  onClick={handleSendClick}
                  disabled={isLoading || !chatInput.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="history"
            className="flex-1 flex flex-col overflow-hidden p-4"
          >
            <Button
              variant="outline"
              className="w-full mb-4"
              onClick={() => onSelectConversation(null)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Chat
            </Button>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {conversationHistoryList.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">
                  No past conversations.
                </p>
              ) : (
                conversationHistoryList.map((item) => (
                  <ConversationHistoryItem
                    key={item.id}
                    item={item}
                    isActive={item.id === activeConversationId}
                    onSelect={() => onSelectConversation(item.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}
