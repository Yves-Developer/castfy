# Plan: demos that look directed, not logged

**Status:** plan. Based on two Excalidraw runs on beta.28 (reports from
2026-11-17) and the reference demo (a smooth, unzoomed signup flow).

## The problem in one line

**The video is the agent's tool log.** Every tool call becomes its own clip,
its own voice line and its own pause, so the way the agent *works* (probing,
checking, retrying, inching forward) becomes the story the viewer watches.

## What we saw

| Symptom | Run |
|---|---|
| Ten "zoom in" keypresses, each a clip with a line: "Closer still… Nearly… One more" | 1 |
| A drag that moves in 20 small steps, each easing in and out, so it stutters | 1, 2 |
| Zooming to 200% only to get a decent box size from a drag | 1 |
| The agent's check screenshots left in the video, as silent pauses (8 s once) | 1, 2 |
| Two label attempts waiting 30 s each before failing | 1 |
| The previous take's drawing still on the canvas; 11 cleanup steps | 2 |
| The video opening on that leftover drawing for 8 s | 2 |
| Keyboard shortcuts (Cmd + →, Enter) changing the page with nothing visible causing it | 1, 2 |

## Root causes (not symptoms)

1. **Working and performing are the same thing.** There's no off-camera mode
   for looking around, checking or setting up. Anything the agent does is
   filmed, and "screenshot to check" is a recorded step.
2. **One tool call is one shot.** The clip, the voice beat and the pause
   follow the agent's call granularity, not the viewer's idea of "one
   action". Repeated small calls become many tiny shots.
3. **The tools only speak "element".** Click, drag and fill target page
   elements. There's no exact position, no path, no double-click, no "press
   this N times". On canvases and maps the agent has to fake precise intent
   with increments and workarounds.
4. **Motion is built from pieces.** Each move eases from rest to rest. A drag
   is 20 eased pieces, and every step starts and stops. Nothing carries
   momentum, so it looks robotic.
5. **Pacing is a fixed table per tool,** not tied to the voice line or to
   when the page settles. That gives silent gaps and rushed beats.
6. **Takes don't start clean.** The recording browser keeps site data
   between runs. Setup happens on camera, and the opening shot is filmed
   before setup.
7. **The agent isn't briefed as a director.** It optimises for finishing the
   task. Nothing tells it to plan shots, keep demos short, never check its
   work on camera, or prefer one decisive action.

## What a good demo needs (the bar)

From the reference demo, and what viewers notice:

- **One continuous take.** No visible fumbling, retries or checks.
- **Every movement has a purpose,** and each action happens once, decisively.
- **Smooth, human motion:** one gesture, one ease in and one ease out, with
  natural arcs and constant speed while dragging.
- **A calm camera.** The window holds still; zoom only to read (beta.28).
- **Real-time typing,** with the field visibly focused.
- **Causes are visible.** If a keyboard shortcut does something, the viewer
  sees the keys.
- **Pacing follows the story:** the voice line and the result, never dead air.
- **Short.** Most demos are 20–45 s.
- **It starts on the real starting state** and ends on the result.

## The plan

### Phase 1: separate working from performing (causes 1, 2, 6, 7)

The biggest gain, and it fixes several symptoms at once.

- **Off-camera tools.** `castfy0_look` (snapshot plus screenshot, never
  recorded) replaces "screenshot to check". Setup actions (clearing state,
  dismissing a banner) can run with `offCamera: true`.
- **Shots, not calls.** Consecutive same-kind actions on the same target
  (zoom ×10, typing in parts, arrow keys) merge into one shot with one voice
  line. A tool can also take `repeat: N` and play as one action.
- **The opening shot is filmed at the first kept step,** never before setup.
- **Fresh takes.** Each run starts with clean site data by default. "Keep
  logins" is an option (for apps behind a login), and "Change something"
  starts from the same clean state.
- **A director's brief** in castfy0's instructions and tool descriptions:
  - plan a shot list first;
  - aim for 20–45 s;
  - one decisive action per shot;
  - never check on camera;
  - prefer visible UI to invisible shortcuts.

### Phase 2: precise gestures and smooth motion (causes 3, 4)

- **Pointer at a position:** click, double-click and drag accept a position
  inside an element (`at: {x, y}` in element or page coordinates), not only
  its centre.
- **Draw with a path:** `drag` accepts `from` and `to` positions, or a list of
  points. "Draw a 240×80 box at 300, 200" becomes one gesture.
- **A motion planner:** one gesture = one curve. The cursor eases in, travels
  at a steady speed along a slight arc, and eases out. It carries momentum
  into the next action when they follow each other. No more 20-piece drags.
- **Keystroke captions:** when the agent presses a shortcut, a small key chip
  (⌘ →) appears near the bottom of the frame for a moment, so the viewer
  sees why the page changed.
- **Typing into rich editors:** if an editor is already focused, type into
  it; time out in about 3 s, not 30.

### Phase 3: pacing and polish (cause 5, plus earlier plans)

- **Pacing from content:** hold each shot until its voice line ends and the
  page has settled, then move on. Cap silent holds at about 1 s.
- **60 fps** recording and export.
- **Cursor shapes** (text cursor over fields, hand over buttons) and **the
  address bar following page changes.**

## How we'll know it worked

A benchmark of fixed demos, re-run after each phase: **Excalidraw (diagram),
Plausible (dashboard), a signup form.** For each, measure:

- length;
- number of voice lines;
- longest silence;
- failed steps;
- stop-start moves (cursor at rest between consecutive actions).

**Target for the Excalidraw diagram:** under 40 s, no line under three words,
no silence over 1.5 s, zero visible checks or retries, every box drawn in one
smooth drag.

## Where the work happens

- **castfy0:**
  - off-camera tools;
  - shot merging;
  - opening shot;
  - position-based actions;
  - the motion planner;
  - pacing;
  - the director's brief.
- **Desktop app:**
  - fresh takes and the "keep logins" option;
  - saving the change instruction in run history;
  - key captions in the Studio and export (drawn like the cursor);
  - 60 fps.
