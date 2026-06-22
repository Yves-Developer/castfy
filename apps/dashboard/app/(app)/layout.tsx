import { SidebarInset, SidebarProvider } from "@castfy/ui/components/sidebar";
import { AppSidebar } from "@/features/_layout/sidebar";

export default function Lyout(props: LayoutProps<"/">) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 52)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar bg="transparent" />
      <SidebarInset className="@container">{props.children}</SidebarInset>
    </SidebarProvider>
  );
}
