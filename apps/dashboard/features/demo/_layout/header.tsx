"use client";
import { Button } from "@castfy/ui/components/button";
import { DownloadIcon } from "lucide-react";
import { DashboardHeader } from "@/features/_layout/header";

export function DemoHeader() {
  return (
    <DashboardHeader feedback={false} title="Introducing vendyy">
      <Button className="ml-auto" size="sm">
        <DownloadIcon />
        Export
      </Button>
    </DashboardHeader>
  );
}
