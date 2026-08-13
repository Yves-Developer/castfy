import { TooltipProvider } from "@castfy/ui/components/tooltip";
import Disconnected from "@/features/app/_layout/disconnected";

export default function Lyout(props: LayoutProps<"/">) {
  return (
    <main className="@container min-h-screen">
      <TooltipProvider>{props.children}</TooltipProvider>
      <Disconnected />
    </main>
  );
}
