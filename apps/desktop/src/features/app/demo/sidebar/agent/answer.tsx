import { Button } from "@castfy/ui/components/button";
import { Input } from "@castfy/ui/components/input";
import { EyeIcon, EyeOffIcon, KeyRoundIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { bridge } from "@/lib/bridge";
import type { InputRequest } from "@/types";

/**
 * The recorder is waiting on the user: a sign-in code sent by email or SMS, a
 * password, anything the agent cannot know. The answer goes straight to the
 * recorder, never through the agent's chat, so it stays out of the transcript.
 * Codes and secrets are typed masked.
 */
export function AnswerCard({
  request,
  onAnswered,
}: {
  request: InputRequest;
  onAnswered: () => void;
}) {
  const masked = request.kind !== "text";
  const [value, setValue] = useState("");
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (answer: string | null) => {
    setBusy(true);
    setError(null);
    const ok = await bridge
      .answerInput(request.sessionId, request.id, answer)
      .catch(() => false);
    setBusy(false);
    if (ok) {
      onAnswered();
    } else {
      setError("Could not send that to the recorder. Try again.");
    }
  };

  return (
    <form
      className="flex flex-col gap-2.5 rounded-xl border border-foreground/20 bg-secondary/40 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) {
          send(value.trim());
        }
      }}
    >
      <div className="flex items-start gap-2">
        <KeyRoundIcon className="mt-0.5 size-3.5 flex-none text-foreground" />
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-xs">The recorder needs you</p>
          <p className="text-[11px] text-muted-foreground">
            {request.question}
          </p>
        </div>
      </div>
      <div className="relative">
        <Input
          autoComplete="one-time-code"
          autoFocus
          className="h-8 pr-8 font-mono text-xs tracking-widest placeholder:font-sans placeholder:tracking-normal"
          disabled={busy}
          onChange={(e) => setValue(e.target.value)}
          placeholder={masked ? "Enter the code" : "Your answer"}
          spellCheck={false}
          type={masked && !shown ? "password" : "text"}
          value={value}
        />
        {masked ? (
          <button
            aria-label={shown ? "Hide" : "Show"}
            className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
            onClick={() => setShown((s) => !s)}
            type="button"
          >
            {shown ? (
              <EyeOffIcon className="size-3.5" />
            ) : (
              <EyeIcon className="size-3.5" />
            )}
          </button>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button
          className="h-7 flex-1 text-xs"
          disabled={busy || value.trim() === ""}
          size="sm"
          type="submit"
          variant="brand"
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : "Send"}
        </Button>
        <Button
          className="h-7 text-xs"
          disabled={busy}
          onClick={() => send(null)}
          size="sm"
          type="button"
          variant="ghost"
        >
          Skip
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Goes only to the recorder; the agent never sees it.
      </p>
      {error ? <p className="text-[11px] text-destructive">{error}</p> : null}
    </form>
  );
}
