"use client";
import { Button } from "@castfy/ui/components/button";
import { Badge } from "@castfy/ui/components/badge";
import { cn } from "@castfy/ui/lib/utils";
import { CheckIcon, CopyIcon, ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AgentRow, ClientRow, Detection } from "@/lib/bridge";
import { bridge } from "@/lib/bridge";
import { CLIENT_ICONS, McpIcon } from "./icons";

/** Which states count as "this client can record". */
const READY = new Set(["connected"]);

const STATE_COPY: Record<string, string> = {
  connected: "Connected",
  "needs-env": "Needs reconnecting",
  "other-entry": "Points elsewhere",
  stale: "Broken link",
  unreadable: "Config unreadable",
  disconnected: "Not connected",
  absent: "Not installed",
};

/**
 * First-run gate.
 *
 * Blocking on purpose: until an agent is registered there is nothing to record
 * with, and letting someone reach New Demo first only buys them a confusing
 * failure. It never appears again once one client is connected.
 */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const [detection, setDetection] = useState<Detection>();
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    bridge.detect().then(setDetection).catch((e) => setError(String(e)));
    bridge
      .agents()
      .then(({ agents: rows, activeAgent: active }) => {
        setAgents(rows);
        setActiveAgent(active);
      })
      .catch(() => setAgents([]));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  const connect = async (id: string) => {
    setBusy(id);
    setError(null);
    try {
      await bridge.connect(id);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const clients = detection?.clients ?? [];
  /** Installed first: what you can act on now, before what you could add. */
  const ordered = [...clients].sort(
    (a, b) => Number(a.status === "absent") - Number(b.status === "absent")
  );
  const anyReady = clients.some((c) => READY.has(c.status));

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="flex w-full max-w-125 flex-col gap-7">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-secondary">
            <McpIcon className="size-5.5" />
          </span>
          <div className="flex flex-col gap-1.5">
            <h1 className="font-semibold text-lg tracking-tight">
              Connect your agent
            </h1>
            <p className="text-balance text-muted-foreground text-sm">
              Castfy records through the AI agent you already pay for. Connecting
              installs the recording engine and points it at your library.
            </p>
          </div>
        </header>

        {detection === undefined ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-xs">
            <Loader2Icon className="size-3.5 animate-spin" />
            Looking for agents…
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {ordered.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-xs">
                <Loader2Icon className="size-3.5 animate-spin" />
                Checking…
              </div>
            ) : (
              ordered.map((client) => {
                const agent = agents.find((a) => a.id === client.id);
                return (
                  <ClientRowCard
                    busy={busy === client.id}
                    client={client}
                    drivable={agent?.drivable ?? false}
                    isActive={activeAgent === client.id}
                    key={client.id}
                    onConnect={() => connect(client.id)}
                    onUse={() => {
                      setActiveAgent(client.id);
                      bridge.selectAgent(client.id).catch(() => {
                        // Preference only; the run falls back regardless.
                      });
                    }}
                  />
                );
              })
            )}
          </div>
        )}

        {detection && !detection.mcpEntryExists ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-xs">
            The recording engine is missing at{" "}
            <span className="font-mono">{detection.mcpEntry}</span>.
          </p>
        ) : null}

        {error ? <p className="text-destructive text-xs">{error}</p> : null}

        <div className="flex flex-col items-center gap-2.5">
          <Button
            className="h-8 w-full text-xs"
            disabled={!anyReady}
            onClick={onDone}
          >
            {anyReady ? "Start using Castfy" : "Connect an agent to continue"}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Restart the client after connecting so it picks up the engine.
          </p>
        </div>
      </div>
    </div>
  );
}

function ClientRowCard({
  client,
  busy,
  drivable,
  isActive,
  onConnect,
  onUse,
}: {
  client: ClientRow;
  busy: boolean;
  drivable: boolean;
  isActive: boolean;
  onConnect: () => void;
  onUse: () => void;
}) {
  const Icon = CLIENT_ICONS[client.id] ?? McpIcon;
  const connected = READY.has(client.status);
  const absent = client.status === "absent";
  /** Has a CLI, and it is not installed. GUI-only clients are not "missing" one. */
  const cliMissing = !absent && Boolean(client.install?.cli) && !drivable;

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-xl border p-3.5 transition-colors",
        isActive && "border-foreground/25 bg-secondary/50",
        absent && "border-dashed"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-9 flex-none items-center justify-center rounded-lg bg-secondary",
            absent && "opacity-50"
          )}
        >
          <Icon className="size-4.5" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className={cn("font-medium text-[13px]", absent && "text-muted-foreground")}>
            {client.label}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {absent ? (
              (client.install?.note ?? "Not installed")
            ) : cliMissing ? (
              <>
                {connected ? "Connected — ask it inside the app. " : ""}
                <span className="text-amber-500">CLI not installed</span>
                {connected
                  ? ", so Castfy cannot start runs from here"
                  : " — Castfy cannot start recordings with it"}
              </>
            ) : connected ? (
              drivable ? (
                "Connected — can record for you"
              ) : (
                "Connected — ask it inside the app"
              )
            ) : (
              (STATE_COPY[client.status] ?? client.status)
            )}
          </p>
        </div>

        {absent ? (
          <Button
            className="h-7 text-xs"
            onClick={() => client.install && bridge.openExternal(client.install.url)}
            size="sm"
            variant="ghost"
          >
            Get it
            <ExternalLinkIcon className="size-3" />
          </Button>
        ) : connected ? (
          drivable ? (
            isActive ? (
              <Badge className="gap-1 text-[10px]" variant="secondary">
                <CheckIcon className="size-3" strokeWidth={3} />
                Recording agent
              </Badge>
            ) : (
              <Button className="h-7 text-xs" onClick={onUse} size="sm" variant="secondary">
                Use for recording
              </Button>
            )
          ) : (
            <Badge className="gap-1 text-[10px]" variant="outline">
              <CheckIcon className="size-3" strokeWidth={3} />
              Connected
            </Badge>
          )
        ) : (
          <Button
            className="h-7 text-xs"
            disabled={busy}
            onClick={onConnect}
            size="sm"
            variant="secondary"
          >
            {busy ? <Loader2Icon className="size-3 animate-spin" /> : "Connect"}
          </Button>
        )}
      </div>

      {(absent || cliMissing) && client.install?.command ? (
        <InstallCommand command={client.install.command} />
      ) : null}

      {cliMissing && !client.install?.command ? (
        <button
          className="flex items-center gap-1.5 self-start text-[11px] text-muted-foreground hover:text-foreground"
          onClick={() => client.install && bridge.openExternal(client.install.url)}
          type="button"
        >
          How to install its CLI
          <ExternalLinkIcon className="size-3" />
        </button>
      ) : null}
    </div>
  );
}

/** The command to run, with a one-click copy — nobody should retype these. */
function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="flex items-center gap-2 rounded-md bg-muted/60 px-2.5 py-1.5 text-left font-mono text-[11px] text-muted-foreground transition-colors hover:bg-muted"
      onClick={() => {
        navigator.clipboard
          .writeText(command)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          })
          .catch(() => {
            // Clipboard refused; the text is on screen to copy by hand.
          });
      }}
      type="button"
    >
      <span className="flex-1 truncate">{command}</span>
      {copied ? (
        <CheckIcon className="size-3 flex-none text-emerald-500" strokeWidth={3} />
      ) : (
        <CopyIcon className="size-3 flex-none" />
      )}
    </button>
  );
}
