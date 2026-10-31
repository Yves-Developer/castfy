import { Button } from "@castfy/ui/components/button";
import { Input } from "@castfy/ui/components/input";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { bridge } from "@/lib/bridge";

/**
 * Redeems a tester's beta code (from their invite) for the signed-in account:
 * unlimited demos while the beta runs. The backend checks the code; this only
 * sends it and shows what it said.
 */
export function BetaCodeForm({ onRedeemed }: { onRedeemed: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redeem = async () => {
    setBusy(true);
    setError(null);
    const result = await bridge.redeemBetaCode(code.trim());
    setBusy(false);
    if (result.ok) {
      onRedeemed();
    } else {
      setError(result.error ?? "That code didn't work. Try again.");
    }
  };

  return (
    <form
      className="flex flex-col gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        redeem();
      }}
    >
      <label className="font-medium text-xs" htmlFor="beta-code">
        Beta code{" "}
        <span className="font-normal text-muted-foreground">
          (from your invite)
        </span>
      </label>
      <div className="flex gap-2">
        <Input
          autoComplete="off"
          className="h-8 font-mono text-xs uppercase"
          id="beta-code"
          onChange={(e) => setCode(e.target.value)}
          placeholder="BETA-XXXXXX"
          spellCheck={false}
          value={code}
        />
        <Button
          className="h-8 text-xs"
          disabled={busy || code.trim() === ""}
          type="submit"
          variant="secondary"
        >
          {busy ? <Loader2Icon className="size-3.5 animate-spin" /> : "Redeem"}
        </Button>
      </div>
      {error ? <p className="text-[11px] text-destructive">{error}</p> : null}
    </form>
  );
}
