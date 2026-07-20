import {
  ChartPieIcon,
  CircleHelpIcon,
  LayoutDashboard,
  ListVideoIcon,
  SettingsIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
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
