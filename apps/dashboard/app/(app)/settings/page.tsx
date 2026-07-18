import type { Metadata } from "next";
import { AppSiteHeader } from "@/features/_layout/app-header";
import { UserProfileCard } from "@/features/settings";
import { AppearanceCard } from "@/features/settings/appearance";
import DeleteUserCard from "@/features/settings/delete-account-card";

export const metadata: Metadata = {
  title: "Settings",
};
export default function Settings() {
  return (
    <>
      <AppSiteHeader title="Settings" />

      <div className="@container/main container mx-auto flex max-w-4xl flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 py-4 md:gap-10 md:py-6">
          <UserProfileCard />
          <AppearanceCard />
          <DeleteUserCard />
        </div>
      </div>
    </>
  );
}
