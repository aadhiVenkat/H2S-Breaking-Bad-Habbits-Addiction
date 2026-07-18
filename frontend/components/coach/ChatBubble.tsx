import type { ChatMessage } from "@/lib/types";
import { FormattedMessage } from "@/components/coach/FormattedMessage";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/dates";

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed animate-fade-in-up", isUser ? "bg-accent text-background rounded-br-md" : "card-surface text-foreground rounded-bl-md")}>
        <FormattedMessage content={message.content} />
        <p className={cn("mt-1 text-[10px]", isUser ? "text-background/50" : "text-foreground-subtle")}>{formatTime(message.timestamp)}</p>
      </div>
    </div>
  );
}
