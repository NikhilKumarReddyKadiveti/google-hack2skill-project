import { Card } from "@/components/ui/card";
import { Heart, User } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  moodScore?: number;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.role === "assistant";
  const displayTime = format(message.timestamp, "HH:mm");

  return (
    <div className="flex items-start space-x-3" data-testid={`chat-message-${message.role}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isAI ? 'bg-primary' : 'bg-muted'
      }`}>
        {isAI ? (
          <Heart className="text-primary-foreground h-4 w-4" />
        ) : (
          <User className="text-muted-foreground h-4 w-4" />
        )}
      </div>
      <div className="flex-1">
        <div className={`rounded-2xl rounded-tl-md p-4 max-w-md ${
          isAI 
            ? 'bg-muted text-foreground' 
            : 'bg-card border border-border text-foreground'
        }`}>
          <p className="leading-relaxed" data-testid="message-content">{message.content}</p>
          {message.moodScore && (
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < message.moodScore! / 2 ? 'bg-accent' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground" data-testid="mood-score">
                Mood: {message.moodScore?.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2" data-testid="message-timestamp">
          {displayTime}
        </p>
      </div>
    </div>
  );
}
