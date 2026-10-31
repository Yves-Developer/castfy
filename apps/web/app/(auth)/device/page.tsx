import type { Metadata } from "next";
import { Suspense } from "react";
import { DeviceApproval } from "@/features/auth/device-approval";

export const metadata: Metadata = {
  title: "Connect the Castfy app",
};

export default function DevicePage() {
  return (
    // Reads ?user_code=, which is only known in the browser.
    <Suspense>
      <DeviceApproval />
    </Suspense>
  );
}
