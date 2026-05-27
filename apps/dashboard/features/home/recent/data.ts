export interface TDemos {
  createdAt: string;
  name: string;
  status: "pending" | "processing" | "success" | "failed";
  url: string;
}

export const recentDemos: TDemos[] = [
  {
    name: "Stripe Payment Flow",
    url: "https://stripe.com",
    status: "success",
    createdAt: "2 minutes ago",
  },
  {
    name: "Linear Project Dashboard",
    url: "https://linear.app",
    status: "processing",
    createdAt: "10 minutes ago",
  },
  {
    name: "Notion AI Workspace",
    url: "https://notion.so",
    status: "pending",
    createdAt: "18 minutes ago",
  },
  {
    name: "Framer Landing Page",
    url: "https://framer.com",
    status: "success",
    createdAt: "35 minutes ago",
  },
  {
    name: "Shopify Product Demo",
    url: "https://shopify.com",
    status: "failed",
    createdAt: "1 hour ago",
  },
];
