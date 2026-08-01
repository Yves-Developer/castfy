import {
  ChartPieIcon,
  CircleHelpIcon,
  LayoutDashboard,
  ListVideoIcon,
  SettingsIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import type { Tdemo } from "@/types";

export const demos: Tdemo[] = [
  {
    name: "Project Name",
    slug: "project-name",
    updatedAt: "24h ago",
    action: "Created",
    img: "/asset-1.jpg",
  },
  {
    name: "Rathon",
    slug: "rathon",
    updatedAt: "24h ago",
    action: "Updated",
  },
];
export const data = {
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
