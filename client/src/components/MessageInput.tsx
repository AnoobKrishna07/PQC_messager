import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (message: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, onTyping, onStopTyping, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTyping?.();
    } else if (isTyping && value.length === 0) {
      setIsTyping(false);
      onStopTyping?.();
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
      setIsTyping(false);
      onStopTyping?.();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <Input
        value={message}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1"
      />
      <Button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        size="icon"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
