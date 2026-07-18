import { Chip } from "@/components/ui/Chip";

export function SuggestedPrompts({ prompts, onSelect }: { prompts: string[]; onSelect: (prompt: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 px-1">
      {prompts.map((prompt) => (
        <Chip key={prompt} onClick={() => onSelect(prompt)} className="text-xs">
          {prompt}
        </Chip>
      ))}
    </div>
  );
}
