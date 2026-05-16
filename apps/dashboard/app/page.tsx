import { Button } from "@workspace/ui/components/button";
import { Card, CardTitle } from "@workspace/ui/components/card";
export default function Home() {
  return (
    <div className="p-20">
      <Button>Dashboard</Button>
      <div>
        <Card>
          <CardTitle>Men</CardTitle>
        </Card>
      </div>
      <div className="font-mono text-muted-foreground text-xs">
        (Press <kbd>d</kbd> to toggle dark mode)
      </div>
    </div>
  );
}
