import { Button } from "@castfy/ui/components/button";
import { cn } from "@castfy/ui/lib/utils";
import { FaChrome } from "react-icons/fa";

const sessions = [
  {
    id: "1",
    browser: "Chrome",
    location: "New York",
    isCurrent: true,
  },
  {
    id: "2",
    browser: "Chrome",
    location: null,
    isCurrent: false,
  },
  {
    id: "3",
    browser: "Chrome",
    location: "Kigali",
    isCurrent: false,
  },
];
export function AccountSessions() {
  return (
    <div className="flex h-full flex-col gap-7.5">
      {sessions.map((session) => (
        <div className="flex items-center gap-4" key={session.id}>
          <FaChrome
            className={cn(
              "size-7.5 text-muted-foreground/50",
              session.isCurrent && "text-primary"
            )}
          />
          <div className="text-xs">
            <p className="font-medium">Chrome</p>
            <p
              className={cn(
                "text-muted-foreground",
                session.isCurrent && "text-primary"
              )}
            >
              {session.isCurrent
                ? "Current Session"
                : `Last seen ${session.location || "Unknown Location"}`}
            </p>
          </div>
          {!session.isCurrent && (
            <Button className="ml-auto" size="sm" variant="secondary">
              Sign Out
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
