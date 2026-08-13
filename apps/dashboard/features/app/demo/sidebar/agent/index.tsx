/** biome-ignore-all lint/correctness/noChildrenProp: for now */
"use client";

import { Button } from "@castfy/ui/components/button";
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
import { useForm, useStore } from "@tanstack/react-form";
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
import { useBackgroundStore } from "@/lib/store";
import type { AgentStep, AIProvider } from "@/types";
import { generateDemo, pickInitialVideo } from "./generate";
import { SelectModel } from "./models";
import { StepsTimeline } from "./step";

const formSchema = z.object({
  webUrl: z.url("Please enter a valid URL."),
  aiPrompt: z.string().min(5, "AI prompt must be at least 5 characters."),
  headless: z.boolean(),
});

export function AgentTab() {
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
      // clear any previously generated video
      useBackgroundStore.getState().setGeneratedVideoUrl(null);

      const params = new URLSearchParams({
        url: value.webUrl,
        promptGoal: value.aiPrompt,
        headless: String(value.headless),
        provider: selectedModel,
      });

      generateDemo(params, {
        onStatus: setCurrentStatusMessage,
        onStep: (step) => setSteps((prev) => [...prev, step]),
        onCompleted: (data) => {
          if (data.videos) {
            setVideos(data.videos);
            const initial = pickInitialVideo(data.videos, data.videoUrl);
            setActiveVideoTab(initial.tab);
            setVideoUrl(initial.url);
            // expose generated URL to global store so player can pick it up
            useBackgroundStore.getState().setGeneratedVideoUrl(initial.url);
          } else if (data.videoUrl) {
            setVideoUrl(data.videoUrl);
            useBackgroundStore.getState().setGeneratedVideoUrl(data.videoUrl);
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
      }).catch((err) => {
        console.error(err);
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to start generation."
        );
        setStatus("error");
      });
    },
  });

  const webUrlValue = useStore(
    form.store,
    (state) => state.values.webUrl ?? ""
  );
  const aiPromptValue = useStore(
    form.store,
    (state) => state.values.aiPrompt ?? ""
  );

  const isSubmitDisabled = !(webUrlValue.trim() || aiPromptValue.trim());

  return (
    <div className="flex h-full flex-col">
      {status === "idle" && (
        <form
          className="h-full flex-1"
          id="agent-demo-form"
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
                      <FieldError
                        className="text-xs"
                        errors={field.state.meta.errors}
                      />
                    )}
                  </Field>
                );
              }}
              name="webUrl"
            />
            <div className="flex h-full flex-1 items-center justify-center">
              <p className="text-center font-medium text-muted-foreground">
                Get started with <br /> our agent
              </p>
            </div>
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
                          <FieldError
                            className="px-1 text-xs"
                            errors={field.state.meta.errors}
                          />
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
                      aria-disabled={isSubmitDisabled}
                      className="rounded-full"
                      disabled={isSubmitDisabled}
                      size="icon-xs"
                      type="submit"
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
          <div className="border-b py-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-xs">
                  {status === "generating" && "Recording Demo Video..."}
                  {status === "completed" && "Demo Recording Completed!"}
                  {status === "error" && "Generation Failed"}
                </p>
                <p className="mt-1.5 flex items-center gap-2 text-muted-foreground text-xs">
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
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6">
            {/* Real-time Steps Timeline */}
            <StepsTimeline steps={steps} />

            {/* Error Message display */}
            {status === "error" && (
              <div className="flex flex-col gap-3 rounded-lg border p-4 text-destructive text-xs">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <h4 className="font-medium">Execution Error</h4>
                    <p className="mt-1">{errorMessage}</p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setStatus("idle");
                    setErrorMessage("");
                    setCurrentStatusMessage("");
                    setSteps([]);
                  }}
                  size="sm"
                  type="button"
                  variant={"secondary"}
                >
                  Restart
                </Button>
              </div>
            )}

            {/* Video Player Display */}
            {status === "completed" && videoUrl && (
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <h3 className="font-medium text-xs">Recorded Video</h3>
                {Object.keys(videos).length > 1 && (
                  <div className="inline-flex rounded-xl border bg-muted/40 p-1">
                    {videos.audioClean && (
                      <Button
                        onClick={() => {
                          setActiveVideoTab("audioClean");
                          setVideoUrl(videos.audioClean);
                        }}
                        size="sm"
                        type="button"
                        variant={
                          activeVideoTab === "audioClean"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        🔊 Clean
                      </Button>
                    )}
                    {videos.audio && (
                      <Button
                        onClick={() => {
                          setActiveVideoTab("audio");
                          setVideoUrl(videos.audio);
                        }}
                        size="sm"
                        type="button"
                        variant={
                          activeVideoTab === "audio" ? "secondary" : "outline"
                        }
                      >
                        <Volume1Icon className="size-3.5" /> Raw
                      </Button>
                    )}
                    {videos.clean && (
                      <Button
                        onClick={() => {
                          setActiveVideoTab("clean");
                          setVideoUrl(videos.clean);
                        }}
                        size="sm"
                        type="button"
                        variant={
                          activeVideoTab === "clean" ? "secondary" : "outline"
                        }
                      >
                        <VolumeXIcon className="size-3.5" /> Clean
                      </Button>
                    )}
                    {videos.raw && (
                      <Button
                        onClick={() => {
                          setActiveVideoTab("raw");
                          setVideoUrl(videos.raw);
                        }}
                        size="sm"
                        type="button"
                        variant={
                          activeVideoTab === "raw" ? "secondary" : "outline"
                        }
                      >
                        <VolumeXIcon className="size-3.5" /> Raw
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
