"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  CheckCircle2Icon,
  Clock3Icon,
  Loader2Icon,
  MoreHorizontalIcon,
  XCircleIcon,
} from "lucide-react";
import type { TDemos } from "./data";

const statusMap = {
  pending: {
    label: "Pending",
    icon: Clock3Icon,
  },
  processing: {
    label: "Processing",
    icon: Loader2Icon,
  },
  success: {
    label: "Success",
    icon: CheckCircle2Icon,
  },
  failed: {
    label: "Failed",
    icon: XCircleIcon,
  },
};

export const recentDemosColumns: ColumnDef<TDemos>[] = [
  {
    accessorKey: "name",
    header: "Demo",
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) => {
      const url = row.original.url;

      return (
        <a
          className="max-w-55 truncate text-muted-foreground hover:text-primary"
          href={url}
          rel="noopener noreferrer"
          target="_blank"
        >
          {url}
        </a>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      const config = statusMap[status];
      const Icon = config.icon;

      return (
        <Badge className="gap-1.5 capitalize" variant="outline">
          <Icon className="size-3.5" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 w-8 p-0" variant="ghost">
              <span className="sr-only">Open menu</span>
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.name)}
            >
              Open
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View demo</DropdownMenuItem>
            <DropdownMenuItem>Move to trash</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
