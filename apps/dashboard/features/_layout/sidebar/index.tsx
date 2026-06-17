"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@castfy/ui/components/sidebar";
import { cn } from "@castfy/ui/lib/utils";
import {
  ChartPieIcon,
  CircleHelpIcon,
  LayoutDashboard,
  ListVideoIcon,
  MousePointer2Icon,
  SettingsIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { siteConfig } from "@/config/site";
import { NavMain } from "./main";
import { NavSecondary } from "./secondary";
import { NavUser } from "./user";

const data = {
  user: {
    name: "Leo Constantin",
    email: "lcon19@gmail.com",
    avatar: "https://github.com/leconstantin.png",
  },

  navMain: [
    {
      title: "Overview",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Playground",
      url: "/playground",
      icon: SparklesIcon,
    },
    {
      title: "My demos",
      url: "/demos",
      icon: ListVideoIcon,
    },
    {
      title: "Trash",
      url: "/trash",
      icon: Trash2Icon,
    },
  ],

  navSecondary: [
    {
      title: "Billing",
      url: "/billing",
      icon: ChartPieIcon,
    },
    {
      title: "Support",
      url: "/support",
      icon: CircleHelpIcon,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <AppSidebarHeader />

      <SidebarContent>
        <NavMain items={data.navMain} pathname={pathname} />
        {/* <NavDemos /> */}
        <NavSecondary
          className="mt-auto"
          items={data.navSecondary}
          pathname={pathname}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

function AppSidebarHeader() {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <SidebarHeader className="group/header">
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center justify-between">
          {/* Logo — visible when expanded, or collapsed but not hovered */}
          <SidebarMenuButton asChild>
            <Link href="/">
              <MousePointer2Icon className="size-6 rotate-90 fill-foreground" />
              {siteConfig.name}
            </Link>
          </SidebarMenuButton>

          {/* Trigger — always visible when expanded, only on hover when collapsed */}
          <SidebarMenuButton
            asChild
            className={cn(
              "w-fit cursor-e-resize text-muted-foreground data-[slot=sidebar-menu-button]:p-1.5!",
              !isExpanded && "hidden lg:group-hover/header:flex"
            )}
          >
            <SidebarTrigger />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
