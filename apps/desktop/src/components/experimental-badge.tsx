import { Badge } from "@castfy/ui/components/badge";

/**
 * Agents Castfy can drive but has not tested end to end. Claude Code is the
 * one recordings are proven on; these work in principle and are marked so
 * testers know what to expect.
 */
const EXPERIMENTAL_AGENTS = new Set(["codex", "cursor"]);

export function isExperimentalAgent(id: string): boolean {
  return EXPERIMENTAL_AGENTS.has(id);
}

/** "Experimental", next to an agent's name; nothing for a tested agent. */
export function ExperimentalBadge({ agentId }: { agentId: string }) {
  if (!isExperimentalAgent(agentId)) {
    return null;
  }
  return (
    <Badge
      className="h-4 px-1.5 text-[9px] uppercase tracking-wide"
      title="Not tested end to end yet. Claude Code is recommended."
      variant="outline"
    >
      Experimental
    </Badge>
  );
}
