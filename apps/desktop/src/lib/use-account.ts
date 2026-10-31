import { useEffect, useState } from "react";
import { type AccountState, bridge } from "@/lib/bridge";
import { useSettingsStore } from "@/lib/store/dialogs";

/**
 * The signed-in account, kept current by account:changed. Null until the
 * first read returns, so callers can render nothing instead of a flash of
 * "signed out".
 */
export function useAccount(): AccountState | null {
  const [account, setAccount] = useState<AccountState | null>(null);

  useEffect(() => {
    bridge
      .account()
      .then(setAccount)
      .catch(() => setAccount({ status: "signed-out", user: null }));
    return bridge.onAccountChange(setAccount);
  }, []);

  return account;
}

/**
 * Signs this app out. The settings dialog is closed first: the app swaps to
 * the sign-in screen, and an open dialog would otherwise reappear over the
 * library after the next sign-in.
 */
export async function signOut(): Promise<void> {
  useSettingsStore.getState().close();
  await bridge.signOut();
}

const WHITESPACE = /\s+/;

/** First letters of the first and last name, for an avatar with no photo. */
export function initials(name: string, email: string): string {
  const parts = name.trim().split(WHITESPACE).filter(Boolean);
  if (parts.length === 0) {
    return email.charAt(0).toUpperCase();
  }
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.charAt(0) ?? "") : "";
  return `${first}${last}`.toUpperCase();
}
