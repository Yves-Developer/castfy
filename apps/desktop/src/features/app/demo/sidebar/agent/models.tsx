import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { Fragment, useCallback, useEffect, useState } from "react";
import { ExperimentalBadge } from "@/components/experimental-badge";
import type { AgentRow } from "@/lib/bridge";
import { bridge } from "@/lib/bridge";
import { useAgentModels } from "../../agent-thread/agent-models";

/**
 * Picks which agent drives the recording.
 *
 * The dashboard listed models here, because the cloud app chose the model
 * itself. On desktop it does not — the user's own agent does — so the thing
 * that actually varies is which agent runs, and that is what this now selects.
 * Agents without a CLI stay listed but disabled: knowing Cursor exists and
 * cannot be driven is more useful than it silently missing.
 */
export function SelectModel({
  selectedModel,
  setSelectedModelAction,
  model = null,
  onModelChange,
}: {
  selectedModel: string;
  setSelectedModelAction: (id: string) => void;
  /** The chosen agent's model (its --model); null for its own default. */
  model?: string | null;
  onModelChange?: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState<AgentRow[]>([]);

  useEffect(() => {
    bridge
      .agents()
      .then(({ agents: rows, activeAgent }) => {
        setAgents(rows);
        // Adopt the saved choice so the sidebar and onboarding agree.
        if (activeAgent && activeAgent !== selectedModel) {
          setSelectedModelAction(activeAgent);
        }
      })
      .catch(() => setAgents([]));
    // Runs once: the saved choice should not fight the user mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedModelAction(id);
      bridge.selectAgent(id).catch(() => {
        // A failed write only costs the preference, not the run.
      });
      setOpen(false);
    },
    [setSelectedModelAction]
  );

  const selected = agents.find((agent) => agent.id === selectedModel);
  const models = useAgentModels(selectedModel);
  const modelLabel = models?.find(
    (m) => m.id === model && m.id !== null
  )?.label;

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger className="flex min-w-0 items-center gap-1 whitespace-nowrap text-xs">
        <span className="truncate">
          {selected?.label ?? "Select agent"}
          {modelLabel ? (
            <span className="text-muted-foreground"> · {modelLabel}</span>
          ) : null}
        </span>
        <ChevronDownIcon className="size-3.5 flex-none" strokeWidth={2.7} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        alignOffset={-10}
        className="max-h-96 w-64 overflow-y-auto"
      >
        <DropdownMenuLabel className="text-[11px] text-muted-foreground">
          Agent
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {agents.map((agent) => (
            <DropdownMenuItem
              className="flex justify-between"
              disabled={!agent.drivable}
              key={agent.id}
              onClick={() => agent.drivable && handleSelect(agent.id)}
            >
              <span className="flex flex-col">
                <span className="flex items-center gap-1.5">
                  {agent.label}
                  <ExperimentalBadge agentId={agent.id} />
                </span>
                {agent.drivable ? null : (
                  <span className="text-[10px] text-muted-foreground">
                    CLI not installed
                  </span>
                )}
              </span>
              {selectedModel === agent.id && (
                <CheckIcon className="text-muted-foreground" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {models && onModelChange ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[11px] text-muted-foreground">
              Model
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {models.map((m, i) => {
                // A model an agent lists itself ("provider/model"): grouped
                // under its provider, so a long list stays readable.
                const listed = m.id?.includes("/") ?? false;
                const heading =
                  listed && m.hint !== models[i - 1]?.hint ? m.hint : null;
                return (
                  <Fragment key={m.id ?? "default"}>
                    {heading ? (
                      <DropdownMenuLabel className="pt-2 text-[10px] text-muted-foreground uppercase tracking-wide">
                        {heading}
                      </DropdownMenuLabel>
                    ) : null}
                    <DropdownMenuItem
                      className="items-start"
                      onClick={() => {
                        onModelChange(m.id);
                        setOpen(false);
                      }}
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{m.label}</span>
                        {listed ? null : (
                          <span className="text-[11px] text-muted-foreground">
                            {m.hint}
                          </span>
                        )}
                      </span>
                      {m.id === model ? (
                        <CheckIcon className="mt-0.5 text-muted-foreground" />
                      ) : null}
                    </DropdownMenuItem>
                  </Fragment>
                );
              })}
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
