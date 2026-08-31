import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

/**
 * Projects are the thing the library lists, and they exist before any footage
 * does: New Demo creates one, the studio opens on it, and only then does the
 * agent record into it.
 *
 * That is why this is separate from the recordings on disk. A session folder is
 * created by the MCP at castfy0_start with an id the app cannot know in
 * advance, so the project holds the title the user typed and picks up its
 * sessionId once a run lands.
 */

function emptyState() {
  return { version: 1, projects: [] };
}

export class ProjectStore {
  constructor(file) {
    this.file = file;
    this.state = emptyState();
    this.queue = Promise.resolve();
  }

  async load() {
    try {
      const parsed = JSON.parse(await fs.readFile(this.file, 'utf8'));
      if (parsed && Array.isArray(parsed.projects)) this.state = parsed;
    } catch {
      // Missing or corrupt. Recordings still exist on disk and get adopted
      // below, so the worst case is losing titles, not work.
      this.state = emptyState();
    }
    return this.state;
  }

  save() {
    this.queue = this.queue.then(async () => {
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      await fs.writeFile(this.file, `${JSON.stringify(this.state, null, 2)}\n`, 'utf8');
    });
    return this.queue;
  }

  list() {
    return [...this.state.projects].sort((a, b) => b.updatedAt - a.updatedAt);
  }

  get(id) {
    return this.state.projects.find((p) => p.id === id) ?? null;
  }

  create({ title }) {
    const now = Date.now();
    const project = {
      id: randomUUID().slice(0, 8),
      title: title.trim() || 'Untitled demo',
      sessionId: null,
      /** Null until the editor is touched; the app then applies its defaults. */
      editor: null,
      /** Null until cuts are edited; the engine's own cuts are used until then. */
      cuts: null,
      createdAt: now,
      updatedAt: now,
    };
    this.state.projects.unshift(project);
    this.save();
    return project;
  }

  rename(id, title) {
    const project = this.get(id);
    if (!project) return null;
    project.title = title.trim() || project.title;
    project.updatedAt = Date.now();
    this.save();
    return project;
  }

  /**
   * The look of one project — background, overlays, aspect ratio. Stored on the
   * project so it cannot bleed into the next one opened.
   */
  setEditor(id, editor) {
    const project = this.get(id);
    if (!project) return null;
    project.editor = editor;
    project.updatedAt = Date.now();
    this.save();
    return project;
  }

  /**
   * The user's in-progress cut edit.
   *
   * Kept on the project rather than written straight to edits.json: until it is
   * exported it is a proposal, and the file on disk must keep describing the
   * video that actually exists next to it. Null means "use the engine's cuts".
   */
  setCuts(id, cuts) {
    const project = this.get(id);
    if (!project) return null;
    project.cuts = cuts;
    project.updatedAt = Date.now();
    this.save();
    return project;
  }

  /** Attach the recording a run produced to the project it was started from. */
  linkSession(id, sessionId) {
    const project = this.get(id);
    if (!project || project.sessionId === sessionId) return project;
    project.sessionId = sessionId;
    project.updatedAt = Date.now();
    this.save();
    return project;
  }

  remove(id) {
    const before = this.state.projects.length;
    this.state.projects = this.state.projects.filter((p) => p.id !== id);
    if (this.state.projects.length !== before) this.save();
  }

  /**
   * Gives a project to every recording that does not have one — sessions made
   * directly from Claude Code never passed through New Demo, and without this
   * they would exist on disk but never appear in the library.
   */
  adopt(sessions) {
    const claimed = new Set(this.state.projects.map((p) => p.sessionId).filter(Boolean));
    let added = 0;

    for (const session of sessions) {
      if (claimed.has(session.id)) continue;
      this.state.projects.push({
        id: session.id,
        title: session.title,
        sessionId: session.id,
        createdAt: session.startedAt ? Date.parse(session.startedAt) : session.mtime,
        updatedAt: session.mtime,
      });
      added++;
    }

    if (added > 0) this.save();
    return added;
  }
}
