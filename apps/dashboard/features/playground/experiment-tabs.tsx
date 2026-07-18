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
import * as z from "zod";
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
  process.env.NEXT_PUBLIC_PLAYGROUND_API_URL ?? "http://localhost:3001";

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

  const runGeneration = async (
    webUrl: string,
    aiPrompt: string,
    headless: boolean,
  ) => {
    try {
      const params = new URLSearchParams({
        url: webUrl,
        promptGoal: aiPrompt,
        headless: String(headless),
        provider: selectedModel,
      });
      const response = await fetch(
        `${PLAYGROUND_API_URL}/api/generate?${params.toString()}`,
      );

      if (!response.ok) {
        // Non-SSE failures (SSRF-block 400, at-capacity 429, 405) return a
        // JSON { error } body — surface that instead of a bare status line.
        let message = `Server error: ${response.statusText}`;
        try {
          const body = await response.json();
          if (body?.error) {
            message = body.error;
          }
        } catch {
          // Non-JSON body; keep the status-line fallback.
        }
        throw new Error(message);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("ReadableStream is not supported by your browser.");
      }

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
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            continue;
          }

          if (trimmed.startsWith("event: ")) {
            currentEvent = trimmed.slice(7).trim();
          } else if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6).trim();
            if (!dataStr) {
              continue;
            }

            try {
              const data = JSON.parse(dataStr);
              if (currentEvent === "status") {
                if (data.message) {
                  setCurrentStatusMessage(data.message);
                }
              } else if (currentEvent === "step") {
                setSteps((prev) => [...prev, data]);
              } else if (currentEvent === "completed") {
                if (data.videos) {
                  setVideos(data.videos);
                  const avail = data.videos;
                  if (avail.audioClean) {
                    setActiveVideoTab("audioClean");
                    setVideoUrl(avail.audioClean);
                  } else if (avail.audio) {
                    setActiveVideoTab("audio");
                    setVideoUrl(avail.audio);
                  } else if (avail.clean) {
                    setActiveVideoTab("clean");
                    setVideoUrl(avail.clean);
                  } else {
                    setActiveVideoTab("raw");
                    setVideoUrl(avail.raw || data.videoUrl);
                  }
                } else if (data.videoUrl) {
                  setVideoUrl(data.videoUrl);
                }
                if (data.steps) {
                  setSteps(data.steps);
                }
                setStatus("completed");
              } else if (currentEvent === "error") {
                setErrorMessage(
                  data.message || "An error occurred during demo generation."
                );
                setStatus("error");
              }
            } catch (e) {
              console.error("Failed to parse SSE event data:", dataStr, e);
            }
          }
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to generate demo.";
      setErrorMessage(errorMsg);
      setStatus("error");
    }
  };

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

      setTimeout(() => {
        runGeneration(value.webUrl, value.aiPrompt, value.headless).catch(
          console.error,
        );
      }, 0);
    },
  });

  const getStepIcon = (action: string) => {
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
  };

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
                  children={(field) => {
                    return (
                      <Field
                        orientation="horizontal"
                        className="items-center justify-between border p-3 rounded-lg bg-slate-50/20"
                      >
                        <div className="space-y-0.5">
                          <FieldLabel
                            htmlFor={field.name}
                            className="text-sm font-semibold"
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
                          id={field.name}
                          name={field.name}
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          checked={field.state.value}
                          onChange={(e) => field.handleChange(e.target.checked)}
                        />
                      </Field>
                    );
                  }}
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
                    <div
                      className="group relative"
                      key={`${step.action}-${idx}`}
                    >
                      {/* Timeline Dot/Icon wrapper */}
                      <span className="absolute top-0 -left-9.25 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm ring-4 ring-white">
                        {getStepIcon(step.action)}
                      </span>

                      {/* Timeline content block */}
                      <div className="flex flex-col gap-1 rounded-lg border bg-white p-3 shadow-sm transition-colors group-hover:border-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">
                            Step {idx + 1}: {step.action}
                          </span>
                          {step.status === "error" ? (
                            <Badge
                              className="px-1.5 py-0 text-[10px]"
                              variant="destructive"
                            >
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
                                <strong className="font-semibold text-slate-600">
                                  Ref:
                                </strong>{" "}
                                {step.ref}
                              </span>
                            )}
                            {step.value && (
                              <span>
                                <strong className="font-semibold text-slate-600">
                                  Val:
                                </strong>{" "}
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
                  ))}
                </div>
              )}
            </div>

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-800 text-sm tracking-wide uppercase">
                    Recorded Video
                  </h3>
                  {Object.keys(videos).length > 1 && (
                    <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/50">
                      {videos.audioClean && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveVideoTab("audioClean");
                            setVideoUrl(videos.audioClean);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            activeVideoTab === "audioClean"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          🔊 Clean
                        </button>
                      )}
                      {videos.audio && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveVideoTab("audio");
                            setVideoUrl(videos.audio);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            activeVideoTab === "audio"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          🔊 Raw
                        </button>
                      )}
                      {videos.clean && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveVideoTab("clean");
                            setVideoUrl(videos.clean);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            activeVideoTab === "clean"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          🔇 Clean
                        </button>
                      )}
                      {videos.raw && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveVideoTab("raw");
                            setVideoUrl(videos.raw);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            activeVideoTab === "raw"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
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
                    key={videoUrl}
                    autoPlay
                    className="aspect-video w-full object-contain"
                    controls
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
