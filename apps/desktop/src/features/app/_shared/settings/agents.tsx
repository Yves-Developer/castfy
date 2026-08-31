"use client";
import { Button } from "@castfy/ui/components/button";
import { Badge } from "@castfy/ui/components/badge";
import { cn } from "@castfy/ui/lib/utils";
import { Loader2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AgentRow, ClientRow, Detection } from "@/lib/bridge";
import { bridge } from "@/lib/bridge";
import { CLIENTS_CHANGED } from "@/lib/events";
import { CLIENT_ICONS, McpIcon } from "@/features/app/onboarding/icons";

const STATE_COPY: Record<string, string> = {
  connected: "Connected",
  "needs-env": "Needs reconnecting",
  "other-entry": "Points at a different build",
  stale: "Broken — engine missing",
  unreadable: "Config unreadable",
  disconnected: "Not connected",
  absent: "Not installed",
};

/**
 * Manage which agents are connected, and which one records.
 *
 * The counterpart to onboarding: that gets you started, this is where you come
 * back to switch agents, repair a registration, or remove Castfy from a client
 * you no longer use.
 */
export function AccountAgents() {
  const [detection, setDetection] = useState<Detection>();
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

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

  useEffect(refresh, [refresh]);

  const act = async (id: string, fn: () => Promise<unknown>) => {
    setBusy(id);
    setError(null);
    try {
      await fn();
      refresh();
      // The gate lives above this dialog and cannot see the change otherwise.
      window.dispatchEvent(new Event(CLIENTS_CHANGED));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  };

  const installed = (detection?.clients ?? []).filter((c) => c.status !== "absent");

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-sm tracking-tight">Agents</h2>
        <p className="text-muted-foreground text-xs">
          Castfy records through the AI agent you already pay for. Connecting
          installs the recording engine into that client.
        </p>
      </div>

      {detection === undefined ? (
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Loader2Icon className="size-3.5 animate-spin" />
          Checking…
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {installed.map((client) => (
            <AgentSettingRow
              agent={agents.find((a) => a.id === client.id)}
              busy={busy === client.id}
              client={client}
              confirming={confirming === client.id}
              isActive={activeAgent === client.id}
              key={client.id}
              onCancel={() => setConfirming(null)}
              onConfirm={() => setConfirming(client.id)}
              onConnect={() => act(client.id, () => bridge.connect(client.id))}
              onDisconnect={() => act(client.id, () => bridge.disconnect(client.id))}
              onUse={() =>
                act(client.id, async () => {
                  await bridge.selectAgent(client.id);
                })
              }
            />
          ))}
        </div>
      )}

      {error ? <p className="text-destructive text-xs">{error}</p> : null}

      <p className="mt-auto text-[11px] text-muted-foreground">
        Each config is backed up before it is changed. Disconnecting removes only
        Castfy's own entry — your other MCP servers are left alone.
      </p>
    </div>
  );
}

function AgentSettingRow({
  client,
  agent,
  isActive,
  busy,
  confirming,
  onConnect,
  onDisconnect,
  onUse,
  onConfirm,
  onCancel,
}: {
  client: ClientRow;
  agent: AgentRow | undefined;
  isActive: boolean;
  busy: boolean;
  confirming: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onUse: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const Icon = CLIENT_ICONS[client.id] ?? McpIcon;
  const connected = client.status === "connected";
  const drivable = agent?.drivable ?? false;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3.5",
        isActive && "border-foreground/25 bg-secondary/40"
      )}
    >
      <span className="flex size-9 flex-none items-center justify-center rounded-lg bg-secondary">
        <Icon className="size-4.5" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <p className="font-medium text-[13px]">{client.label}</p>
          {isActive ? (
            <Badge className="text-[10px]" variant="secondary">
              Recording agent
            </Badge>
          ) : null}
        </div>
        <p className="truncate text-[11px] text-muted-foreground">
          {connected && !drivable
            ? "Connected — ask it inside the app"
            : (STATE_COPY[client.status] ?? client.status)}
        </p>
      </div>

      {busy ? (
        <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
      ) : confirming ? (
        // Two-step, because this edits a config their editor depends on.
        <div className="flex items-center gap-1.5">
          <Button className="h-7 text-xs" onClick={onCancel} size="sm" variant="ghost">
            Cancel
          </Button>
          <Button className="h-7 text-xs" onClick={onDisconnect} size="sm" variant="destructive">
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          {connected && drivable && !isActive ? (
            <Button className="h-7 text-xs" onClick={onUse} size="sm" variant="secondary">
              Use for recording
            </Button>
          ) : null}
          {connected ? (
            <Button className="h-7 text-xs" onClick={onConfirm} size="sm" variant="ghost">
              Disconnect
            </Button>
          ) : (
            <Button className="h-7 text-xs" onClick={onConnect} size="sm" variant="secondary">
              {client.status === "disconnected" ? "Connect" : "Repair"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
