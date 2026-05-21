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
} from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";
import {
  CreditCardIcon,
  HelpCircle,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { siteConfig } from "@/config/site";
import { NavDemos } from "./nav-demos";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const data = {
  user: {
    name: "Leo Constantin",
    email: "lcon19@gmail.com",
    avatar: "https://github.com/leconstantin.png",
  },

  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Playground",
      url: "/playground",
      icon: Sparkles,
    },
    {
      title: "Subscriptions",
      url: "#",
      icon: CreditCardIcon,
    },

    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircle,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircle,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <AppSidebarHeader />

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDemos />
        {/* <NavSecondary className="mt-auto" items={data.navSecondary} /> */}
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
          <SidebarMenuButton
            asChild
            className={cn(
              "w-fit data-[slot=sidebar-menu-button]:p-1.5!",
              !isExpanded && "group-hover/header:hidden"
            )}
          >
            <Link href="/">
              <Sparkles className="size-5" />
              <span className="sr-only text-base">{siteConfig.name}</span>
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
