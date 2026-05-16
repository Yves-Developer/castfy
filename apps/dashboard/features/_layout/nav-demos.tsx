"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import {
  ClapperboardIcon,
  EllipsisIcon,
  FolderIcon,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";

const projectNames = [
  {
    slug: "demoforge",
    label: "DemoForge",
  },
  {
    slug: "snapdemo",
    label: "SnapDemo",
  },
  {
    slug: "url2demo",
    label: "URL2Demo",
  },
  {
    slug: "showcase-ai",
    label: "Showcase AI",
  },
  {
    slug: "demofy",
    label: "Demofy",
  },
  {
    slug: "pitchframe",
    label: "PitchFrame",
  },
  {
    slug: "instant-demo",
    label: "Instant Demo",
  },
  {
    slug: "previewpilot",
    label: "PreviewPilot",
  },
  {
    slug: "sitevision-ai",
    label: "SiteVision AI",
  },
  {
    slug: "clickdemo",
    label: "ClickDemo",
  },
];
export function NavDemos() {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent demos</SidebarGroupLabel>
      <SidebarMenu>
        {projectNames.map((project) => (
          <SidebarMenuItem key={project.slug}>
            <SidebarMenuButton
              asChild
              className="group/btn text-foreground/80 capitalize"
            >
              <a href={`/#${project.slug}`}>
                <ClapperboardIcon />
                <span>{project.label}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  className="rounded-sm data-[state=open]:bg-accent"
                  showOnHover
                >
                  <EllipsisIcon />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isMobile ? "end" : "start"}
                className="w-24 rounded-lg"
                side={isMobile ? "bottom" : "right"}
              >
                <DropdownMenuItem>
                  <FolderIcon />
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ShareIcon />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2Icon />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <EllipsisIcon className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
