import type { ReactNode } from "react";
import { splitMessageBlocks, tokenizeInline } from "@/lib/utils/markdown";

/**
 * Renders coach/user chat text with common Markdown patterns
 * Gemini tends to emit (bold, italic, line breaks, simple lists).
 */
export function FormattedMessage({ content, className }: { content: string; className?: string }) {
  const blocks = splitMessageBlocks(content);
  return (
    <div className={className ?? "space-y-2"}>
      {blocks.map((block, i) => {
        if (block.type === "list") {
          return (
            <ul key={i} className="list-disc space-y-1 pl-4">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): ReactNode[] {
  return tokenizeInline(text).map((token, i) => {
    switch (token.type) {
      case "bold":
        return (
          <strong key={i} className="font-semibold">
            {token.value}
          </strong>
        );
      case "italic":
        return (
          <em key={i} className="italic">
            {token.value}
          </em>
        );
      case "code":
        return (
          <code key={i} className="rounded bg-overlay px-1 py-0.5 text-[0.9em]">
            {token.value}
          </code>
        );
      default:
        return <span key={i}>{token.value}</span>;
    }
  });
}
