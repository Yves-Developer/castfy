/** biome-ignore-all lint/correctness/noChildrenProp: for now */
"use client";

import { Badge } from "@castfy/ui/components/badge";
import { Button } from "@castfy/ui/components/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@castfy/ui/components/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@castfy/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@castfy/ui/components/input-group";
import { Switch } from "@castfy/ui/components/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@castfy/ui/components/tooltip";
import { useForm } from "@tanstack/react-form";
import {
  AlertTriangle,
  ArrowUpIcon,
  LinkIcon,
  Loader2,
  Volume1Icon,
  VolumeXIcon,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import type { AgentStep, AIProvider } from "@/types";
import { generateDemo, pickInitialVideo } from "./generate";
import { SelectModel } from "./models";
import { StepsTimeline } from "./step";

const formSchema = z.object({
  demoTitle: z.string().min(5, "Demo title must be at least 5 characters."),
  webUrl: z.string().url("Please enter a valid URL."),
  aiPrompt: z.string().min(5, "AI prompt must be at least 5 characters."),
  headless: z.boolean(),
});

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation
export function AgentTabq() {
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
    <div className="flex h-full flex-col">
      {status === "idle" && (
        <form
          className="h-full flex-1"
          id="playground-demo-form "
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="h-full">
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="sr-only" htmlFor={field.name}>
                      Web URL
                    </FieldLabel>
                    <InputGroup className="h-7.5">
                      <InputGroupInput
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        className="font-medium text-xs placeholder:text-xs"
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Product Url"
                        value={field.state.value}
                      />
                      <InputGroupAddon>
                        <LinkIcon className="size-3" strokeWidth={2.7} />
                      </InputGroupAddon>
                    </InputGroup>

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="webUrl"
            />
            <div className="mt-auto block">
              <InputGroup>
                <form.Field
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel className="sr-only" htmlFor={field.name}>
                          AI Prompt
                        </FieldLabel>
                        <InputGroupTextarea
                          aria-invalid={isInvalid}
                          className="resize-none text-xs"
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Generate demo..."
                          rows={6}
                          value={field.state.value}
                        />

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                  name="aiPrompt"
                />
                <InputGroupAddon
                  align="block-end"
                  className="flex justify-between border-foreground/10 border-t"
                >
                  <SelectModel
                    selectedModel={selectedModel}
                    setSelectedModelAction={(id) => {
                      setSelectedModel(id as AIProvider);
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <form.Field
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;
                        return (
                          <Field
                            data-invalid={isInvalid}
                            orientation="horizontal"
                          >
                            <FieldLabel
                              className="sr-only"
                              htmlFor={field.name}
                            >
                              Headless
                            </FieldLabel>

                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Switch
                                    aria-invalid={isInvalid}
                                    checked={field.state.value}
                                    id={field.name}
                                    name={field.name}
                                    onCheckedChange={field.handleChange}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  If enabled, the browser will run in the
                                  background. Disable this if you want to
                                  visually observe the browser actions on
                                  screen.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </Field>
                        );
                      }}
                      name="headless"
                    />

                    <Button
                      className="rounded-full"
                      disabled
                      form="playground-demo-form"
                      size="icon-xs"
                    >
                      <ArrowUpIcon strokeWidth={2.7} />
                    </Button>
                  </div>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </FieldGroup>
        </form>
      )}

      {status !== "idle" && (
        <div>
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
                      <span className="font-medium text-muted-foreground">
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
              <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50/50 p-4 text-destructive">
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
                          <Volume1Icon className="size-3.5" /> Raw
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
                          <VolumeXIcon className="size-3.5" /> Clean
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
                          <VolumeXIcon className="size-3.5" /> Raw
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden rounded-xl border">
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
        </div>
      )}
    </div>
  );
}
