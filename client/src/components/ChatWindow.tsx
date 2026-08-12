import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { UserAvatar } from "./UserAvatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: Date;
}

interface User {
  id: number;
  name: string | null;
  email: string | null;
  isOnline: boolean;
}

interface ChatWindowProps {
  messages: Message[];
  currentUserId?: number;
  selectedUser?: User;
  onSendMessage: (content: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  isTyping?: boolean;
  isLoading?: boolean;
}

export function ChatWindow({
  messages,
  currentUserId,
  selectedUser,
  onSendMessage,
  onTyping,
  onStopTyping,
  isTyping = false,
  isLoading = false,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="border-b border-border p-4 flex items-center gap-3">
        <div className="relative">
          <UserAvatar name={selectedUser.name} size="md" />
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
              selectedUser.isOnline ? "bg-green-500" : "bg-gray-500"
            }`}
          />
        </div>
        <div>
          <h2 className="font-semibold">{selectedUser.name}</h2>
          <p className="text-xs text-muted-foreground">
            {selectedUser.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div>
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                isSent={msg.senderId === currentUserId}
                senderName={msg.senderId !== currentUserId ? selectedUser.name || "User" : undefined}
                timestamp={msg.createdAt}
              />
            ))
          )}
          {isTyping && (
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs text-muted-foreground">{selectedUser.name} is typing</p>
              <TypingIndicator />
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <MessageInput
          onSend={onSendMessage}
          onTyping={onTyping}
          onStopTyping={onStopTyping}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
