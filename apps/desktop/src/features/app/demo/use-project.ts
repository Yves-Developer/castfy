import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import type { Project } from '@/lib/bridge';
import { bridge } from '@/lib/bridge';
import { api } from '@/lib/local-api';
import { useConvexQuery } from '@/lib/local-query';
import { bestVideo, editingSource } from '@/lib/projects';
import type { EditorState } from '@/lib/store';
import { useBackgroundStore } from '@/lib/store';

/** Editor writes are frequent — dragging an overlay fires on every frame. */
const SAVE_DEBOUNCE_MS = 500;

/** Only the fields that describe a project's look get saved. */
function editorSliceOf(state: ReturnType<typeof useBackgroundStore.getState>): EditorState {
  return {
    backgroundConfig: state.backgroundConfig,
    imageOverlays: state.imageOverlays,
    selectedAspectRatio: state.selectedAspectRatio,
    customDimensions: state.customDimensions,
  };
}

/**
 * Loads the project the studio is open on, points the player at its recording,
 * and binds the editor's look to that project.
 *
 * The look has to be per project: the store is a single global, so without this
 * a background chosen for one demo silently becomes the background of every
 * demo opened afterwards.
 */
export function useStudioProject(): {
  project: Project | null | undefined;
  slug: string | undefined;
} {
  const { slug } = useParams();
  const project = useConvexQuery<Project | null>(api.projects.get, { id: slug ?? '' });
  const loadEditorState = useBackgroundStore((s) => s.loadEditorState);

  /**
   * Guards the save subscription: hydrating the store fires the same change
   * events a user edit does, and saving those would write one project's look
   * onto the next one during the switch.
   */
  const hydratedFor = useRef<string | null>(null);

  // Apply this project's saved look, or the defaults when it has none.
  useEffect(() => {
    if (!slug || project === undefined) return;
    hydratedFor.current = null;
    loadEditorState((project?.editor as EditorState | null) ?? null);
    hydratedFor.current = slug;
  }, [slug, project, loadEditorState]);

  // Persist changes back onto the project.
  useEffect(() => {
    if (!slug) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = useBackgroundStore.subscribe((state) => {
      // Ignore everything until this project's state is the one in the store.
      if (hydratedFor.current !== slug) return;

      clearTimeout(timer);
      const snapshot = editorSliceOf(state);
      timer = setTimeout(() => {
        bridge.saveEditor(slug, snapshot).catch(() => {
          // A failed write costs the look, not the recording.
        });
      }, SAVE_DEBOUNCE_MS);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [slug]);

  return { project, slug };
}

/**
 * Points the player at the right video for the current mode.
 *
 * Deliberately separate from useStudioProject, and called from exactly one
 * place. Three components were mounting that hook — the editor with its mode,
 * plus the header and the route with the default — and each wrote the same
 * global url. Whichever ran last won, so the studio played raw footage while
 * the mode said otherwise.
 */
export function useStudioSource(
  project: Project | null | undefined,
  mode: 'edit' | 'result'
): string | null {
  const setGeneratedVideoUrl = useBackgroundStore((s) => s.setGeneratedVideoUrl);

  const url =
    (mode === 'result' ? bestVideo(project?.session) : editingSource(project?.session)) ?? null;

  useEffect(() => {
    setGeneratedVideoUrl(url);
    // Cleared on the way out, so a project that has not been recorded yet
    // cannot show the previous one's footage.
    return () => setGeneratedVideoUrl(null);
  }, [url, setGeneratedVideoUrl]);

  return url;
}
