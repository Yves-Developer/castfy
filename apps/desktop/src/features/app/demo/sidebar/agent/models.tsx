import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AgentRow } from "@/lib/bridge";
import { bridge } from "@/lib/bridge";

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
}: {
  selectedModel: string;
  setSelectedModelAction: (id: string) => void;
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

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger className="flex items-center gap-1 text-xs">
        <span>{selected?.label ?? "Select agent"}</span>
        <ChevronDownIcon className="size-3.5" strokeWidth={2.7} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" alignOffset={-10} className="w-50">
        <DropdownMenuGroup>
          {agents.map((agent) => (
            <DropdownMenuItem
              className="flex justify-between"
              disabled={!agent.drivable}
              key={agent.id}
              onClick={() => agent.drivable && handleSelect(agent.id)}
            >
              <span className="flex flex-col">
                {agent.label}
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
