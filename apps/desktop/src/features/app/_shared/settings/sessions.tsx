import { Button } from "@castfy/ui/components/button";
import { cn } from "@castfy/ui/lib/utils";
import { GlobeIcon, Loader2Icon, MonitorIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type AccountSession, bridge } from "@/lib/bridge";
import { signOut } from "@/lib/use-account";

const CASTFY_AGENT = /^Castfy\/[\d.\w-]+ \(([^)]+)\)/;

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const SYSTEMS: [RegExp, string][] = [
  [/Windows/, "Windows"],
  [/iPhone|iPad/, "iOS"],
  [/Android/, "Android"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/Linux/, "Linux"],
];

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * What a session is, from its User-Agent: the Castfy app sends its own
 * (account.js), the website's sessions carry the browser's.
 */
function describe(userAgent: string): { app: boolean; label: string } {
  const castfy = CASTFY_AGENT.exec(userAgent);
  if (castfy) {
    return { app: true, label: `Castfy app on ${castfy[1]}` };
  }
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1];
  const system = SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1];
  if (!browser) {
    return { app: false, label: "Unknown device" };
  }
  return { app: false, label: system ? `${browser} on ${system}` : browser };
}

function lastActive(iso: string): string {
  const ago = Date.now() - Date.parse(iso);
  if (ago < MINUTE_MS) {
    return "Active just now";
  }
  if (ago < HOUR_MS) {
    return `Active ${Math.floor(ago / MINUTE_MS)} min ago`;
  }
  if (ago < DAY_MS) {
    return `Active ${Math.floor(ago / HOUR_MS)} h ago`;
  }
  return `Active ${new Date(iso).toLocaleDateString()}`;
}

/**
 * Every place the account is signed in: this app, other copies of it, and
 * browsers that signed in on the website. Any but this one can be signed out
 * here; this one signs out the app.
 */
export function AccountSessions() {
  const [sessions, setSessions] = useState<AccountSession[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await bridge.sessions();
    if (result.ok) {
      setSessions(result.sessions);
      setError(null);
    } else {
      setError(result.error);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const revoke = async (session: AccountSession) => {
    setBusyId(session.id);
    if (session.current) {
      await signOut();
      return;
    }
    const result = await bridge.revokeSession(session.id);
    if (!result.ok) {
      setError(result.error ?? "Could not sign out that session.");
    }
    await load();
    setBusyId(null);
  };

  if (error && !sessions) {
    return <p className="m-auto text-destructive text-xs">{error}</p>;
  }
  if (!sessions) {
    return (
      <Loader2Icon className="m-auto size-4 animate-spin text-muted-foreground" />
    );
  }

  return (
    <div className="flex h-full flex-col gap-7.5">
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
      {sessions.map((session) => {
        const { app, label } = describe(session.userAgent);
        const Icon = app ? MonitorIcon : GlobeIcon;
        return (
          <div className="flex items-center gap-4" key={session.id}>
            <Icon
              className={cn(
                "size-7.5 flex-none text-muted-foreground/50",
                session.current && "text-primary"
              )}
            />
            <div className="min-w-0 text-xs">
              <p className="truncate font-medium">{label}</p>
              <p
                className={cn(
                  "text-muted-foreground",
                  session.current && "text-primary"
                )}
              >
                {session.current
                  ? "This app — current session"
                  : lastActive(session.updatedAt)}
              </p>
            </div>
            <Button
              className="ml-auto"
              disabled={busyId !== null}
              onClick={() => revoke(session)}
              size="sm"
              variant="secondary"
            >
              {busyId === session.id ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : null}
              Sign out
            </Button>
          </div>
        );
      })}
    </div>
  );
}
