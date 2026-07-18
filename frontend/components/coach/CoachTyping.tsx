export function CoachTyping() {
  return (
    <div className="flex w-full justify-start">
      <div className="card-surface flex items-center gap-1 rounded-2xl rounded-bl-md px-4 py-3">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-typing-dot" style={{ animationDelay: "0ms" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-typing-dot" style={{ animationDelay: "150ms" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-typing-dot" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
