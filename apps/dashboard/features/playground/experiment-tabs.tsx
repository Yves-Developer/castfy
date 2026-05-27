import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { useState } from "react";
import { toast } from "sonner";
import type { AIProvider } from "./api-settings";

interface ExperimentTabsProps {
  provider: AIProvider;
}

export function ExperimentTabs({ provider }: ExperimentTabsProps) {
  const [activeTab, setActiveTab] = useState<"scrape" | "map" | "full">(
    "scrape"
  );
  const [url, setUrl] = useState("");
  const [promptGoal, setPromptGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleTest = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }
    if ((activeTab === "map" || activeTab === "full") && !promptGoal) {
      toast.error("Please enter a Goal/Prompt for the AI Agent.");
      return;
    }

    setLoading(true);
    setResult("Processing...");

    try {
      let endpoint = "";
      if (activeTab === "scrape") {
        endpoint = "http://localhost:4000/api/test/scrape";
      } else if (activeTab === "map") {
        endpoint = "http://localhost:4000/api/test/map";
      } else {
        endpoint = "http://localhost:4000/api/generate";
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, provider, promptGoal }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unknown error occurred");
      }

      setResult(JSON.stringify(data, null, 2));
      // biome-ignore lint/suspicious/noExplicitAny: for now
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex gap-4 border-b pb-4">
          <Button
            onClick={() => setActiveTab("scrape")}
            variant={activeTab === "scrape" ? "default" : "ghost"}
          >
            1. Scrape Only
          </Button>
          <Button
            onClick={() => setActiveTab("map")}
            variant={activeTab === "map" ? "default" : "ghost"}
          >
            2. Agentic Map Only
          </Button>
          <Button
            onClick={() => setActiveTab("full")}
            variant={activeTab === "full" ? "default" : "ghost"}
          >
            3. Full Video
          </Button>
        </div>
        <CardTitle className="mt-6">
          {activeTab === "scrape" && "Test: Accessibility Snapshot"}
          {activeTab === "map" && "Test: AI Agent Explorer"}
          {activeTab === "full" && "Test: Full Demo Generation"}
        </CardTitle>
        <CardDescription>
          {activeTab === "scrape" &&
            "Fetches the raw DOM tree using Demosmith. No API key required."}
          {activeTab === "map" &&
            "The AI Agent will open a hidden browser and click around the live site until it achieves the goal."}
          {activeTab === "full" &&
            "Executes the Agentic loop and then renders the final video."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Start URL</Label>
          <Input
            id="url"
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://vendyy.store"
            value={url}
          />
        </div>

        {activeTab !== "scrape" && (
          <div className="space-y-2">
            <Label htmlFor="prompt">Goal / Instructions</Label>
            <Input
              id="prompt"
              onChange={(e) => setPromptGoal(e.target.value)}
              placeholder="e.g. Navigate to Products, add the blue shirt to cart, and go to checkout."
              value={promptGoal}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Output Result</Label>
          <Textarea
            className="min-h-75 bg-muted font-mono text-sm"
            placeholder="Results will appear here..."
            readOnly
            value={result}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled={loading || !url} onClick={handleTest}>
          {loading ? "Running..." : "Execute Test"}
        </Button>
      </CardFooter>
    </Card>
  );
}
