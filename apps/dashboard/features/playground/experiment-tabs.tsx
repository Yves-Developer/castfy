import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { type AIProvider } from "./api-settings";

interface ExperimentTabsProps {
  provider: AIProvider;
}

export function ExperimentTabs({ provider }: ExperimentTabsProps) {
  const [activeTab, setActiveTab] = useState<"scrape" | "map" | "full">("scrape");
  const [url, setUrl] = useState("");
  const [promptGoal, setPromptGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleTest = async () => {
    if (!url) return alert("Please enter a URL");
    if ((activeTab === "map" || activeTab === "full") && !promptGoal) {
      return alert("Please enter a Goal/Prompt for the AI Agent.");
    }

    setLoading(true);
    setResult("Processing...");

    try {
      let endpoint = "";
      if (activeTab === "scrape") endpoint = "http://localhost:4000/api/test/scrape";
      else if (activeTab === "map") endpoint = "http://localhost:4000/api/test/map";
      else endpoint = "http://localhost:4000/api/generate";

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
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex border-b pb-4 gap-4">
          <Button
            variant={activeTab === "scrape" ? "default" : "ghost"}
            onClick={() => setActiveTab("scrape")}
          >
            1. Scrape Only
          </Button>
          <Button
            variant={activeTab === "map" ? "default" : "ghost"}
            onClick={() => setActiveTab("map")}
          >
            2. Agentic Map Only
          </Button>
          <Button
            variant={activeTab === "full" ? "default" : "ghost"}
            onClick={() => setActiveTab("full")}
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
          {activeTab === "scrape" && "Fetches the raw DOM tree using Demosmith. No API key required."}
          {activeTab === "map" && "The AI Agent will open a hidden browser and click around the live site until it achieves the goal."}
          {activeTab === "full" && "Executes the Agentic loop and then renders the final video."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Start URL</Label>
          <Input
            id="url"
            placeholder="https://vendyy.store"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        {activeTab !== "scrape" && (
          <div className="space-y-2">
            <Label htmlFor="prompt">Goal / Instructions</Label>
            <Input
              id="prompt"
              placeholder="e.g. Navigate to Products, add the blue shirt to cart, and go to checkout."
              value={promptGoal}
              onChange={(e) => setPromptGoal(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Output Result</Label>
          <Textarea
            className="min-h-[300px] font-mono text-sm bg-muted"
            readOnly
            value={result}
            placeholder="Results will appear here..."
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleTest} disabled={loading || !url}>
          {loading ? "Running..." : "Execute Test"}
        </Button>
      </CardFooter>
    </Card>
  );
}
