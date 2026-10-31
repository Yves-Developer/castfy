import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import { bridge } from "@/lib/bridge";

/**
 * Saves a problem report to Downloads (the given recording, else the newest)
 * and says where it went, with a way to the Discord to post it.
 */
export async function reportProblem(sessionId?: string | null): Promise<void> {
  const pending = toast.loading("Preparing your report…");
  const result = await bridge.report(sessionId ?? null);
  toast.dismiss(pending);
  if (!result.ok) {
    toast.error("Couldn't save the report", { description: result.error });
    return;
  }
  toast.success("Report saved to your Downloads", {
    description:
      "Drag it into #bugs on our Discord, with a line on what happened.",
    action: siteConfig.links.discord
      ? {
          label: "Open Discord",
          onClick: () => bridge.openExternal(siteConfig.links.discord),
        }
      : undefined,
    duration: 12_000,
  });
}
