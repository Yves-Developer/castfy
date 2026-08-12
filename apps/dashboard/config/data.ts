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
export const demoVideoUrl =
  "https://pub-79872054c8cb4a23b5f90577293ece4f.r2.dev/Framer%20Update_%20CMS%203.0.mp4";
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

export const models = [
  {
    chef: "OpenAI",
    chefSlug: "openai",
    id: "gpt-4o",
    name: "GPT-4o",
    providers: ["openai", "azure"],
  },

  {
    chef: "Google",
    chefSlug: "gemini",
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    providers: ["google", "google-vertex"],
  },

  {
    chef: "Claude",
    chefSlug: "anthropic",
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    providers: ["anthropic"],
  },
];
