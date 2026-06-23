# SetList — Architecture

Technical decisions, patterns, and data model. Read alongside CLAUDE.md and
IMPLEMENTATION_PLAN.md before writing code.

---

## Stack

- **Pure HTML/CSS/JS.** No framework, no bundler, no npm. Single file `SetList.html`
  for the app shell; only `sw.js` and `manifest.json` as separate files.
- **Zero external runtime dependencies** for core features. Add one only with a concrete,
  approved reason.
- **Targets Android Chrome.** Mobile-first; desktop is a dev convenience.

---

## Core Model (conceptual)

- An **Exercise** is independent (Push-ups, Squats, …).
- Each Exercise optionally has ONE **Schedule** (days, times, target sets×reps).
  No schedule = exists but not active (e.g. Squats sitting idle).
- The app computes today's **due sessions** from each exercise's schedule.
- The user marks a due session **done** or **skipped** — that creates a **SessionRecord**.
- There is NO per-set/per-rep logging. Progression = the user editing the schedule.

---

## Data Storage

**Decision: `localStorage` for v0.1, behind a small `store` abstraction** so it can move
to IndexedDB later without a rewrite. Records are small JSON; localStorage is simplest.

### Storage keys
- `setlist.exercises` → array of Exercise objects (schedule embedded)
- `setlist.records`   → array of SessionRecord objects
- `setlist.settings`  → app-level settings (e.g. lastOpenedAt)
- `setlist.schemaVersion` → integer, for future migrations

---

## Data Model

### Exercise (with embedded schedule)
```json
{
  "id": "exr_<uuid>",
  "name": "Push-ups",
  "schedule": {
    "days": [1, 3, 5],            // 0=Sun … 6=Sat; ISO-ish, document and be consistent
    "times": ["07:00", "14:00"],  // "HH:MM" 24h; up to 2 now, design allows 3+
    "sets": 2,
    "reps": 10
  },
  "createdAt": "<ISO8601>",
  "updatedAt": "<ISO8601>"
}
```
Notes:
- `schedule` may be `null` → the exercise exists but is not scheduled (won't appear in
  the Today view). This is the "Squats idle" state.
- `times` array length is not hard-capped in the data model; the v0.1 UI exposes up to 2,
  but the model and rendering must not break with 3+ (future bump).
- `sets` and `reps` are stored separately (not a "2x10" string) so progression edits and
  any future stats are clean.
- Editing the schedule mutates the live exercise. It does NOT retroactively change past
  SessionRecords, which snapshot the target at the time (see below).
- (Future, Phase 6) schedule may gain an optional `futureChanges` array of dated
  overrides. Keep the shape open to that; do not implement in v0.1.

### SessionRecord (one marked session)
```json
{
  "id": "rec_<uuid>",
  "exerciseId": "exr_<uuid>",
  "exerciseName": "Push-ups",     // denormalized snapshot; survives exercise deletion
  "date": "2026-06-23",           // local date of the scheduled session
  "time": "07:00",                // scheduled time slot this record corresponds to
  "targetSets": 2,                // snapshot of target at completion time
  "targetReps": 10,               // snapshot
  "status": "done",               // "done" | "skipped"
  "markedAt": "<ISO8601>"         // when the user tapped Done/Skip
}
```
Notes:
- Snapshot `exerciseName`, `targetSets`, `targetReps` so history stays accurate after the
  user edits or deletes the exercise/schedule.
- One record per (exercise, date, time) slot. Marking the same slot again updates that
  record rather than duplicating.

### Settings
```json
{ "lastOpenedAt": "<ISO8601>" }
```
No notification-permission state — reminders are native phone alarms, not web notifs.

---

## Due-session computation

For a given local date:
1. For each exercise with a non-null schedule:
   - If the date's weekday is in `schedule.days`, emit one due session per entry in
     `schedule.times`, carrying the current `sets`/`reps`.
2. Cross-reference existing SessionRecords for that date to mark each due slot as
   done / skipped / still-pending.
3. Sort the Today view by time.

Keep this in a pure function (input: date + exercises + records → list of due slots with
status) so it's testable and reused by Today view and history.

---

## Module Shape (within SetList.html)

- `store`     — all persistence (localStorage read/write, JSON guard, schema version).
- `exercises` — CRUD for exercises and their schedules; validation.
- `schedule`  — due-session computation (pure functions); weekday/time helpers.
- `sessions`  — mark done/skip → create/update SessionRecord; query history.
- `reminders` — native-alarm helper (intent affordance + fallback text). No web notifs.
- `history`   — read records, compute progression readout / completion rate.
- `ui`        — rendering + event wiring (screen switching, forms, Today view, Done).
- `boot`      — init, SW registration (Phase 2+), first-run / empty states.

Plain functions and small module-objects (`const store = { ... }`), no framework.

---

## Screens / Navigation

Single-page screen-swap (show/hide sections), no router library:
1. **Today** (home) — due sessions across all exercises, by time; big Done + Skip.
2. **Exercises** — list of exercises; add; tap one to edit it and its schedule.
3. **Edit Exercise** — name; schedule (days, times [up to 2 now], sets, reps); or set
   "no schedule"; the native-alarm helper (Phase 3) lives here.
4. **History** — per-exercise records and progression readout (Phase 4).
5. **Settings** — data export/import (Phase 5); note explaining the native-alarm model.

Cheap transitions (opacity/transform); respect `prefers-reduced-motion`.

---

## Reminders (Phase 3) — native-alarm helper, not in-app scheduling

The app does NOT fire notifications. Native phone clock alarms are the mechanism; the app
stores schedule times for display and helps set matching alarms.

- Preferred affordance: Android `AlarmClock.ACTION_SET_ALARM` intent (attempt via intent
  URL, feature-detect; may be blocked by Chrome/Android version — treat as bonus).
- Always-present fallback: show the time(s) + a one-line instruction to add them in the
  Clock app.
- No Notification permission request; no service-worker notification scheduling; no
  Notification Triggers API.
- Short UI line so the model is obvious.

If true in-app scheduling is ever required, that's the Capacitor/native APK path
(Phase 7), not a change to the web app's responsibilities.

---

## Accessibility & UX baseline

- Minimum 44×44px tap targets; the primary Done button larger still.
- High contrast; legible at arm's length.
- Respect `prefers-reduced-motion` and `prefers-color-scheme` where reasonable.
- All actions reachable by touch without precision gestures.

---

## Future-proofing notes

- `store` is the seam for IndexedDB migration (Phase 4+) and export/import (Phase 5).
- Keep `schedule` open to an optional `futureChanges` list (Phase 6) and `times` open to
  3+ entries — both should be additive, not rewrites.
- The single-file web app stays the source of truth even if a Capacitor APK is added.
