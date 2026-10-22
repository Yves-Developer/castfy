import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import { CheckIcon, ChevronDownIcon, MicIcon, MicOffIcon } from "lucide-react";
import { useCallback, useState } from "react";

/**
 * Picks the recording's voiceover: none, or one of Microsoft Edge's voices
 * (free, no key). castfy0 speaks a line per step and lets the voice set the
 * video's pace; the agent writes the lines.
 */
export const VOICES = [
  { id: "en-US-AriaNeural", label: "Aria", accent: "US, female" },
  { id: "en-US-JennyNeural", label: "Jenny", accent: "US, female" },
  { id: "en-US-EmmaNeural", label: "Emma", accent: "US, female" },
  { id: "en-US-GuyNeural", label: "Guy", accent: "US, male" },
  { id: "en-US-AndrewNeural", label: "Andrew", accent: "US, male" },
  { id: "en-GB-SoniaNeural", label: "Sonia", accent: "UK, female" },
  { id: "en-GB-RyanNeural", label: "Ryan", accent: "UK, male" },
  { id: "en-AU-NatashaNeural", label: "Natasha", accent: "Australia, female" },
  { id: "en-IN-NeerjaNeural", label: "Neerja", accent: "India, female" },
] as const;

const STORAGE_KEY = "castfy.voice";

/** The voice chosen last time; null for none. Kept per machine. */
export function useVoiceChoice(): [string | null, (voice: string | null) => void] {
  const [voice, setVoice] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return VOICES.some((v) => v.id === saved) ? saved : null;
    } catch {
      return null;
    }
  });
  const choose = useCallback((next: string | null) => {
    setVoice(next);
    try {
      if (next) {
        localStorage.setItem(STORAGE_KEY, next);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Only the preference is lost.
    }
  }, []);
  return [voice, choose];
}

export function SelectVoice({
  voice,
  onChange,
}: {
  voice: string | null;
  onChange: (voice: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = VOICES.find((v) => v.id === voice);
  const pick = (next: string | null) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger
        aria-label="Voiceover"
        className="flex min-w-0 items-center gap-1 whitespace-nowrap text-xs"
        data-castfy="voice-picker"
      >
        {selected ? (
          <MicIcon className="size-3.5 flex-none" strokeWidth={2.4} />
        ) : (
          <MicOffIcon className="size-3.5 flex-none text-muted-foreground" strokeWidth={2.4} />
        )}
        <span className="truncate">{selected ? selected.label : "No voice"}</span>
        <ChevronDownIcon className="size-3.5 flex-none" strokeWidth={2.7} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" alignOffset={-10} className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex justify-between" onClick={() => pick(null)}>
            <span className="flex flex-col">
              No voice
              <span className="text-[10px] text-muted-foreground">A silent video</span>
            </span>
            {selected ? null : <CheckIcon className="size-3.5" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {VOICES.map((v) => (
            <DropdownMenuItem
              className="flex justify-between"
              key={v.id}
              onClick={() => pick(v.id)}
            >
              <span className="flex flex-col">
                {v.label}
                <span className="text-[10px] text-muted-foreground">{v.accent}</span>
              </span>
              {v.id === voice ? <CheckIcon className="size-3.5" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
