import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export type AIProvider = "anthropic" | "openai" | "gemini";

interface ApiSettingsProps {
  provider: AIProvider;
  setProvider: (provider: AIProvider) => void;
}

export function ApiSettings({ provider, setProvider }: ApiSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Provider</CardTitle>
        <CardDescription>
          Select the model you want to use for generating the automation script.
          (Make sure the corresponding API key is set in your backend .env
          file).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Button
            onClick={() => setProvider("anthropic")}
            variant={provider === "anthropic" ? "default" : "outline"}
          >
            Claude 3.5 Sonnet
          </Button>
          <Button
            onClick={() => setProvider("openai")}
            variant={provider === "openai" ? "default" : "outline"}
          >
            GPT-4o
          </Button>
          <Button
            onClick={() => setProvider("gemini")}
            variant={provider === "gemini" ? "default" : "outline"}
          >
            Gemini 2.5 Pro
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
