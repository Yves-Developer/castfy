/** biome-ignore-all lint/correctness/noChildrenProp: for now */
"use client";

import { Badge } from "@castfy/ui/components/badge";
import { Button } from "@castfy/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@castfy/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@castfy/ui/components/field";
import { Input } from "@castfy/ui/components/input";
import { Textarea } from "@castfy/ui/components/textarea";
import { useForm } from "@tanstack/react-form";
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  Globe,
  Keyboard,
  Loader2,
  MousePointer,
  Move,
  RefreshCw,
  ShieldCheck,
  Type,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Model } from "./model";

const formSchema = z.object({
  demoTitle: z.string().min(5, "Demo title must be at least 5 characters."),
  webUrl: z.string().url("Please enter a valid URL."),
  aiPrompt: z.string().min(5, "AI prompt must be at least 5 characters."),
  headless: z.boolean(),
});

interface AgentStep {
  action: string;
  description: string;
  error?: string;
  ref?: string;
  status: "success" | "error";
  value?: string;
}

export type AIProvider = "anthropic" | "openai" | "gemini";

// Origin of the playground backend. Configurable per-env; defaults to the
// port documented in apps/playground/.env.example (3001).
const PLAYGROUND_API_URL =
  process.env.NEXT_PUBLIC_PLAYGROUND_API_URL ?? "http://localhost:4000";

// Shape of any SSE event payload the backend emits (status/step/completed/error).
interface SseEventData {
  message?: string;
  videos?: Record<string, string>;
  videoUrl?: string;
  steps?: AgentStep[];
  action?: string;
  description?: string;
  status?: "success" | "error";
  ref?: string;
  value?: string;
  error?: string;
}

interface SseHandlers {
  onStatus: (message: string) => void;
  onStep: (step: AgentStep) => void;
  onCompleted: (data: SseEventData) => void;
  onError: (message: string) => void;
}

// Choose which recorded variant to show first: clean audio > audio > clean > raw.
function pickInitialVideo(
  videos: Record<string, string>,
  fallbackUrl?: string
): { tab: string; url: string } {
  if (videos.audioClean) {
    return { tab: "audioClean", url: videos.audioClean };
  }
  if (videos.audio) {
    return { tab: "audio", url: videos.audio };
  }
  if (videos.clean) {
    return { tab: "clean", url: videos.clean };
  }
  return { tab: "raw", url: videos.raw ?? fallbackUrl ?? "" };
}

async function readErrorMessage(response: Response): Promise<string> {
  // Non-SSE failures (SSRF-block 400, at-capacity 429, 405) return a JSON
  // { error } body — surface that instead of a bare status line.
  try {
    const body = (await response.json()) as { error?: string };
    if (body?.error) {
      return body.error;
    }
  } catch {
    // Non-JSON body; fall through to the status-line fallback.
  }
  return `Server error: ${response.statusText}`;
}

function dispatchSseEvent(
  event: string,
  data: SseEventData,
  handlers: SseHandlers
): void {
  switch (event) {
    case "status":
      if (data.message) {
        handlers.onStatus(data.message);
      }
      break;
    case "step":
      handlers.onStep(data as AgentStep);
      break;
    case "completed":
      handlers.onCompleted(data);
      break;
    case "error":
      handlers.onError(
        data.message ?? "An error occurred during demo generation."
      );
      break;
    default:
      break;
  }
}

function parseAndDispatch(
  event: string,
  dataStr: string,
  handlers: SseHandlers
): void {
  if (!dataStr) {
    return;
  }
  try {
    dispatchSseEvent(event, JSON.parse(dataStr) as SseEventData, handlers);
  } catch (e) {
    console.error("Failed to parse SSE event data:", dataStr, e);
  }
}

async function readSseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  handlers: SseHandlers
): Promise<void> {
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let currentEvent = "";

  while (true) {
    const { value: chunk, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("event: ")) {
        currentEvent = trimmed.slice(7).trim();
      } else if (trimmed.startsWith("data: ")) {
        parseAndDispatch(currentEvent, trimmed.slice(6).trim(), handlers);
      }
    }
  }
}

async function generateDemo(
  params: URLSearchParams,
  handlers: SseHandlers
): Promise<void> {
  try {
    const response = await fetch(
      `${PLAYGROUND_API_URL}/api/generate?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("ReadableStream is not supported by your browser.");
    }
    await readSseStream(reader, handlers);
  } catch (err) {
    handlers.onError(
      err instanceof Error ? err.message : "Failed to generate demo."
    );
  }
}

function getStepIcon(action: string) {
  switch (action.toLowerCase()) {
    case "navigate":
    case "snapshot":
      return <Globe className="h-5 w-5 text-blue-500" />;
    case "click":
      return <MousePointer className="h-5 w-5 text-indigo-500" />;
    case "fill":
      return <Keyboard className="h-5 w-5 text-amber-500" />;
    case "select":
      return <ChevronDown className="h-5 w-5 text-emerald-500" />;
    case "hover":
      return <Move className="h-5 w-5 text-pink-500" />;
    case "press_key":
      return <Type className="h-5 w-5 text-cyan-500" />;
    case "scroll":
      return <ArrowUpDown className="h-5 w-5 text-purple-500" />;
    case "assert":
      return <ShieldCheck className="h-5 w-5 text-teal-500" />;
    case "submit_journey":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    default:
      return <Globe className="h-5 w-5 text-slate-500" />;
  }
}

function StepItem({ step, index }: { step: AgentStep; index: number }) {
  return (
    <div className="group relative">
      <span className="-left-9.25 absolute top-0 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm ring-4 ring-white">
        {getStepIcon(step.action)}
      </span>
      <div className="flex flex-col gap-1 rounded-lg border bg-white p-3 shadow-sm transition-colors group-hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">
            Step {index + 1}: {step.action}
          </span>
          {step.status === "error" ? (
            <Badge className="px-1.5 py-0 text-[10px]" variant="destructive">
              Error
            </Badge>
          ) : (
            <Badge
              className="border-slate-200 bg-slate-100 px-1.5 py-0 text-[10px] text-slate-600"
              variant="secondary"
            >
              Success
            </Badge>
          )}
        </div>
        <p className="font-medium text-slate-700 text-sm leading-relaxed">
          {step.description}
        </p>
        {(step.ref || step.value) && (
          <div className="mt-1.5 flex flex-wrap gap-1.5 rounded border border-slate-100 bg-slate-50 p-1.5 font-mono text-[11px] text-slate-500">
            {step.ref && (
              <span>
                <strong className="font-semibold text-slate-600">Ref:</strong>{" "}
                {step.ref}
              </span>
            )}
            {step.value && (
              <span>
                <strong className="font-semibold text-slate-600">Val:</strong>{" "}
                {step.value}
              </span>
            )}
          </div>
        )}
        {step.error && (
          <p className="mt-1 rounded border border-red-100 bg-red-50/50 p-2 font-mono text-red-500 text-xs">
            Error: {step.error}
          </p>
        )}
      </div>
    </div>
  );
}

function StepsTimeline({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
        Agent Actions
      </h3>
      {steps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50/30 p-8">
          <Loader2 className="mb-2 h-6 w-6 animate-spin text-slate-400" />
          <span className="font-medium text-slate-500 text-sm">
            Waiting for first action...
          </span>
        </div>
      ) : (
        <div className="relative ml-3 space-y-4 border-slate-200 border-l pl-6">
          {steps.map((step, idx) => (
            <StepItem index={idx} key={`${step.action}-${idx}`} step={step} />
          ))}
        </div>
      )}
    </div>
  );
}

const VIDEO_TABS: { key: string; label: string }[] = [
  { key: "audioClean", label: "🔊 Clean" },
  { key: "audio", label: "🔊 Raw" },
  { key: "clean", label: "🔇 Clean" },
  { key: "raw", label: "🔇 Raw" },
];

function VideoResult({
  videos,
  activeVideoTab,
  videoUrl,
  onSelect,
}: {
  videos: Record<string, string>;
  activeVideoTab: string;
  videoUrl: string;
  onSelect: (tab: string, url: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
          Recorded Video
        </h3>
        {Object.keys(videos).length > 1 && (
          <div className="inline-flex rounded-xl border border-slate-200/50 bg-slate-100 p-1">
            {VIDEO_TABS.filter((tab) => videos[tab.key]).map((tab) => (
              <button
                className={`rounded-lg px-3 py-1.5 font-semibold text-xs transition-all ${
                  activeVideoTab === tab.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                key={tab.key}
                onClick={() => onSelect(tab.key, videos[tab.key])}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border bg-black shadow-lg">
        {/* biome-ignore lint/a11y/useMediaCaption: no captions for recorded demo video */}
        <video
          autoPlay
          className="aspect-video w-full object-contain"
          controls
          key={videoUrl}
          src={videoUrl}
        />
      </div>
    </div>
  );
}

export function ExperimentTabs() {
  const [selectedModel, setSelectedModel] = useState<AIProvider>("anthropic");

  const [status, setStatus] = useState<
    "idle" | "generating" | "completed" | "error"
  >("idle");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [currentStatusMessage, setCurrentStatusMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videos, setVideos] = useState<Record<string, string>>({});
  const [activeVideoTab, setActiveVideoTab] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm({
    defaultValues: {
      demoTitle: "",
      webUrl: "",
      aiPrompt: "",
      headless: true,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      setStatus("generating");
      setSteps([]);
      setVideoUrl("");
      setVideos({});
      setActiveVideoTab("");
      setErrorMessage("");
      setCurrentStatusMessage("Initializing session...");

      const params = new URLSearchParams({
        url: value.webUrl,
        promptGoal: value.aiPrompt,
        headless: String(value.headless),
        provider: selectedModel,
      });

      setTimeout(() => {
        generateDemo(params, {
          onStatus: setCurrentStatusMessage,
          onStep: (step) => setSteps((prev) => [...prev, step]),
          onCompleted: (data) => {
            if (data.videos) {
              setVideos(data.videos);
              const initial = pickInitialVideo(data.videos, data.videoUrl);
              setActiveVideoTab(initial.tab);
              setVideoUrl(initial.url);
            } else if (data.videoUrl) {
              setVideoUrl(data.videoUrl);
            }
            if (data.steps) {
              setSteps(data.steps);
            }
            setStatus("completed");
          },
          onError: (message) => {
            setErrorMessage(message);
            setStatus("error");
          },
        }).catch(console.error);
      }, 0);
    },
  });

  return (
    <div className="mx-auto mt-8 w-full max-w-2xl">
      {status === "idle" && (
        <Card>
          <CardHeader>
            <CardTitle>Record Product Demo</CardTitle>
            <CardDescription>
              Provide your URL and instructions. The AI agent will record the
              browser interaction live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="playground-demo-form"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup>
                <form.Field
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Demo Title</FieldLabel>
                        <Input
                          aria-invalid={isInvalid}
                          autoComplete="off"
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="My saas demo"
                          value={field.state.value}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                  name="demoTitle"
                />
                <form.Field
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Web URL</FieldLabel>
                        <Input
                          aria-invalid={isInvalid}
                          autoComplete="off"
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="https://my-saas-demo.com"
                          value={field.state.value}
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                  name="webUrl"
                />
                <form.Field
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>AI Prompt</FieldLabel>
                        <Textarea
                          aria-invalid={isInvalid}
                          className="min-h-24 resize-none"
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Provide a detailed goal for the AI agent (e.g. Navigate to checkout)..."
                          rows={6}
                          value={field.state.value}
                        />
                        <FieldDescription>
                          Provide a detailed prompt for the AI to generate a
                          best results.
                        </FieldDescription>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                  name="aiPrompt"
                />
                <form.Field
                  children={(field) => (
                    <Field
                      className="items-center justify-between rounded-lg border bg-slate-50/20 p-3"
                      orientation="horizontal"
                    >
                      <div className="space-y-0.5">
                        <FieldLabel
                          className="font-semibold text-sm"
                          htmlFor={field.name}
                        >
                          Run Headless
                        </FieldLabel>
                        <FieldDescription className="text-xs">
                          If enabled, the browser will run in the background.
                          Disable this if you want to visually observe the
                          browser actions on screen.
                        </FieldDescription>
                      </div>
                      <input
                        checked={field.state.value}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary"
                        id={field.name}
                        name={field.name}
                        onChange={(e) => field.handleChange(e.target.checked)}
                        type="checkbox"
                      />
                    </Field>
                  )}
                  name="headless"
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between border-t">
            <Model
              selectedModel={selectedModel}
              setSelectedModelAction={(id) => {
                setSelectedModel(id as AIProvider);
              }}
            />
            <Button
              className="rounded-full px-6"
              form="playground-demo-form"
              size="lg"
              type="submit"
            >
              Generate Demo
            </Button>
          </CardFooter>
        </Card>
      )}

      {status !== "idle" && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {status === "generating" && "Recording Demo Video..."}
                  {status === "completed" && "Demo Recording Completed!"}
                  {status === "error" && "Generation Failed"}
                </CardTitle>
                <CardDescription className="mt-1.5 flex items-center gap-2">
                  {status === "generating" && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="font-medium text-slate-700">
                        {currentStatusMessage}
                      </span>
                    </>
                  )}
                  {status === "completed" &&
                    "Deliverables have been successfully saved."}
                  {status === "error" && "An error occurred during execution."}
                </CardDescription>
              </div>
              {status === "completed" && (
                <Badge
                  className="border-green-200 bg-green-50 text-green-700"
                  variant="outline"
                >
                  Completed
                </Badge>
              )}
              {status === "generating" && (
                <Badge
                  className="animate-pulse border-blue-200 bg-blue-50 text-blue-700"
                  variant="outline"
                >
                  Recording
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Real-time Steps Timeline */}
            <StepsTimeline steps={steps} />

            {/* Error Message display */}
            {status === "error" && (
              <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50/50 p-4 text-red-700">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Execution Error</h4>
                  <p className="mt-1 font-mono text-xs">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Video Player Display */}
            {status === "completed" && videoUrl && (
              <div className="space-y-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
                    Recorded Video
                  </h3>
                  {Object.keys(videos).length > 1 && (
                    <div className="inline-flex rounded-xl border border-slate-200/50 bg-slate-100 p-1">
                      {videos.audioClean && (
                        <button
                          className={`rounded-lg px-3 py-1.5 font-semibold text-xs transition-all ${
                            activeVideoTab === "audioClean"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                          onClick={() => {
                            setActiveVideoTab("audioClean");
                            setVideoUrl(videos.audioClean);
                          }}
                          type="button"
                        >
                          🔊 Clean
                        </button>
                      )}
                      {videos.audio && (
                        <button
                          className={`rounded-lg px-3 py-1.5 font-semibold text-xs transition-all ${
                            activeVideoTab === "audio"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                          onClick={() => {
                            setActiveVideoTab("audio");
                            setVideoUrl(videos.audio);
                          }}
                          type="button"
                        >
                          🔊 Raw
                        </button>
                      )}
                      {videos.clean && (
                        <button
                          className={`rounded-lg px-3 py-1.5 font-semibold text-xs transition-all ${
                            activeVideoTab === "clean"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                          onClick={() => {
                            setActiveVideoTab("clean");
                            setVideoUrl(videos.clean);
                          }}
                          type="button"
                        >
                          🔇 Clean
                        </button>
                      )}
                      {videos.raw && (
                        <button
                          className={`rounded-lg px-3 py-1.5 font-semibold text-xs transition-all ${
                            activeVideoTab === "raw"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                          onClick={() => {
                            setActiveVideoTab("raw");
                            setVideoUrl(videos.raw);
                          }}
                          type="button"
                        >
                          🔇 Raw
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden rounded-xl border bg-black shadow-lg">
                  {/* biome-ignore lint/a11y/useMediaCaption: no captions for recorded demo video */}
                  <video
                    autoPlay
                    className="aspect-video w-full object-contain"
                    controls
                    key={videoUrl}
                    src={videoUrl}
                  />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end border-t pt-6">
            {(status === "completed" || status === "error") && (
              <Button
                className="gap-2 rounded-full px-6"
                onClick={() => {
                  setStatus("idle");
                  setSteps([]);
                  setVideoUrl("");
                  setVideos({});
                  setActiveVideoTab("");
                  setErrorMessage("");
                  setCurrentStatusMessage("");
                  form.reset();
                }}
                size="lg"
              >
                <RefreshCw className="h-4 w-4" />
                Record Another Demo
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
