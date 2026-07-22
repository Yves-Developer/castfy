import { TooltipProvider } from "@castfy/ui/components/tooltip";

export default function Lyout(props: LayoutProps<"/">) {
  return (
    <main className="@container min-h-screen">
      <TooltipProvider>{props.children}</TooltipProvider>
    </main>
  );
}
