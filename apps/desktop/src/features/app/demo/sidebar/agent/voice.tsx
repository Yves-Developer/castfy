import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import { CheckIcon, ChevronDownIcon, MicIcon, MicOffIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { bridge } from "@/lib/bridge";

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

const isVoice = (value: unknown): value is string =>
  VOICES.some((v) => v.id === value);

/**
 * The voice chosen last time; null for none. Kept per machine, in Castfy's
 * settings file.
 *
 * It used to live only in the window's localStorage, which Chromium writes
 * to disk lazily: after a crash, a force quit or a shutdown with the app
 * open the choice could be gone, and the picker was back to "No voice". The
 * settings file is written at once. localStorage stays as the instant first
 * guess, before the settings have been read.
 */
export function useVoiceChoice(): [string | null, (voice: string | null) => void] {
  const [voice, setVoice] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return isVoice(saved) ? saved : null;
    } catch {
      return null;
    }
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: read once per mount; the first guess only seeds the migration
  useEffect(() => {
    let cancelled = false;
    bridge
      .settings()
      .then((settings) => {
        if (cancelled) {
          return;
        }
        if (settings.voice === undefined) {
          // Chosen before the settings file kept it: keep it there from now.
          bridge.setSettings({ voice }).catch(() => undefined);
          return;
        }
        setVoice(isVoice(settings.voice) ? settings.voice : null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const choose = useCallback((next: string | null) => {
    setVoice(next);
    bridge.setSettings({ voice: next }).catch(() => undefined);
    try {
      if (next) {
        localStorage.setItem(STORAGE_KEY, next);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // The settings file has it.
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
