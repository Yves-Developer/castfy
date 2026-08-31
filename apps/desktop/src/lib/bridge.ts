export type SessionStatus = 'complete' | 'recording' | 'failed' | 'abandoned';

export type VideoVariant = 'audioClean' | 'audio' | 'clean' | 'raw';

export interface SessionSummary {
  totalSteps: number;
  successCount: number;
  failureCount: number;
  totalDuration: number;
  excludedSteps: number;
}

export interface Session {
  id: string;
  dir: string;
  title: string;
  status: SessionStatus;
  videos: Partial<Record<VideoVariant, string>>;
  mtime: number;
  startUrl?: string;
  startedAt?: string;
  completedAt?: string;
  summary?: SessionSummary;
  stepCount?: number;
  guide?: boolean;
  /** First step screenshot, used as the project cover. */
  thumb?: string;
  error?: string;
  /** Detail view only. */
  steps?: Array<{
    id: number;
    action: string;
    description: string;
    duration: number;
    success?: boolean;
    error?: string;
  }>;
  guideText?: string | null;
  /** Everything the timeline draws. */
  timeline?: Timeline;
}

export interface Library {
  root: string;
  sessions: Session[];
  missing: boolean;
}

export interface ClientInstall {
  /** Whether this client has a CLI at all. False means GUI-only by design. */
  cli: boolean;
  /** Copyable install command, when the client has one. */
  command?: string;
  url: string;
  note: string;
}

export interface ClientRow {
  id: string;
  label: string;
  file: string;
  status: string;
  entryPath?: string;
  install: ClientInstall | null;
}

export interface Detection {
  mcpEntry: string;
  mcpEntryExists: boolean;
  outputDir: string;
  clients: ClientRow[];
}

export interface AgentRow {
  id: string;
  label: string;
  /** Absolute path to its CLI, or null when not installed. */
  binary: string | null;
  /** Whether Castfy can start a run with it, as opposed to only registering it. */
  drivable: boolean;
}

export interface Run {
  id: string;
  url: string;
  goal: string;
  status: 'running' | 'finished' | 'failed';
  startedAt: number;
  finishedAt: number | null;
  exitCode: number | null;
  error: string | null;
  sessionIds: string[];
}

export interface CutRange {
  startMs: number;
  endMs: number;
  reason?: string;
  stepIds?: number[];
}

export interface TimelineStep {
  id: number;
  action: string;
  description: string;
  startMs: number;
  durationMs: number;
  excluded: boolean;
  failed: boolean;
}

export interface Timeline {
  totalDurationMs: number;
  /** The engine's original proposal, preserved across edits. */
  aiCuts: CutRange[];
  /** What the clean video on disk was rendered from. */
  appliedCuts: CutRange[];
  steps: TimelineStep[];
  narration: Array<{ stepId: number; startMs: number; endMs: number; text: string }>;
}

export interface Project {
  id: string;
  title: string;
  sessionId: string | null;
  createdAt: number;
  updatedAt: number;
  /** Saved look of this project; null until the editor is touched. */
  editor: unknown | null;
  /** Pending cut edit; null means the engine's cuts stand. */
  cuts: CutRange[] | null;
  /** The recording this project points at, once it has one. */
  session: Session | null;
}

export interface DemoInput {
  url: string;
  goal: string;
  /** Links the resulting recording back to the project it was started from. */
  projectId?: string | null;
  /** Overrides the saved choice for this run. */
  agentId?: string | null;
}

export interface CastfyBridge {
  list(): Promise<Library>;
  get(id: string): Promise<Session | null>;
  runs(): Promise<Run[]>;

  projects(): Promise<Project[]>;
  project(id: string): Promise<Project | null>;
  createProject(title: string): Promise<Project>;
  renameProject(id: string, title: string): Promise<Project | null>;
  removeProject(id: string): Promise<boolean>;
  saveEditor(id: string, editor: unknown): Promise<Project | null>;
  saveCuts(id: string, cuts: CutRange[] | null): Promise<Project | null>;
  recut(
    sessionId: string,
    cuts: CutRange[]
  ): Promise<{
    ok: boolean;
    error?: string;
    cleanDurationMs?: number;
    narrationStale?: boolean;
  }>;

  render(
    sessionId: string,
    spec?: Record<string, unknown>
  ): Promise<{ ok: boolean; error?: string; outputLocation?: string }>;
  onExportProgress(cb: (p: { sessionId: string; message?: string }) => void): () => void;
  reveal(dir: string): Promise<void>;
  onChange(cb: () => void): () => void;

  detect(): Promise<Detection>;
  connect(id: string): Promise<{ ok: boolean; file: string; backedUp: boolean }>;
  disconnect(id: string): Promise<{ ok: boolean; changed: boolean; file: string }>;
  openExternal(url: string): Promise<void>;
  agents(): Promise<{ agents: AgentRow[]; activeAgent: string | null }>;
  selectAgent(id: string): Promise<string | null>;

  compose(input: DemoInput): Promise<string>;
  copyPrompt(input: DemoInput): Promise<boolean>;
  run(input: DemoInput): Promise<{ ok: boolean; error?: string; bin?: string; runId?: string }>;
  cancel(): Promise<boolean>;
  onLog(cb: (chunk: string) => void): () => void;
  onDone(
    cb: (r: {
      code: number;
      error?: string;
      /** Why it happened, when it is something the user can act on. */
      hint?: string | null;
      runId?: string;
      /** The recording this run produced, once it has one. */
      sessionId?: string | null;
      projectId?: string | null;
    }) => void
  ): () => void;
}

declare global {
  interface Window {
    castfy: CastfyBridge;
  }
}

export const bridge = window.castfy;
