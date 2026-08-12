import { formatDistanceToNow } from "date-fns";

interface MessageBubbleProps {
  content: string;
  isSent: boolean;
  senderName?: string;
  timestamp: Date;
}

export function MessageBubble({ content, isSent, senderName, timestamp }: MessageBubbleProps) {
  return (
    <div className={`flex ${isSent ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-xs break-words rounded-lg px-4 py-2 ${
          isSent
            ? "bg-blue-600 text-white"
            : "bg-gray-700 text-white"
        }`}
      >
        {!isSent && senderName && (
          <p className="text-xs font-semibold mb-1 opacity-80">{senderName}</p>
        )}
        <p className="text-sm">{content}</p>
        <p className="text-xs mt-1 opacity-70">
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
