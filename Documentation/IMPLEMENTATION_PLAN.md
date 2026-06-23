# SetList — Implementation Plan

A mobile-first PWA for scheduling your own bodyweight exercises — each independently —
and marking each scheduled session done. No build toolchain — pure HTML/CSS/JS.

---

## Guiding Principle

The user controls everything. Each exercise has its own standing schedule (days, times,
sets×reps). The app tells the user what to do and records only whether the session was
**done** or **skipped** — no per-set/per-rep logging. Progression is by editing the
schedule, never by an algorithm.

---

## Phase 0 — Documentation + Scaffold  (this phase)

### Deliverables
- `Documentation/CLAUDE.md` (done)
- `Documentation/IMPLEMENTATION_PLAN.md` — this file
- `Documentation/ARCHITECTURE.md` — technical decisions & data model
- `Documentation/CHANGELOG.md` — version history (seeded with v0.0.0)

### Acceptance criteria
- All four docs exist and agree on the data model before any app code is written.

---

## Phase 1 — Core App (v0.1)

**Goal:** A working single-file app to define exercises, give each a standing schedule,
see what's due, and mark sessions done. No PWA install or alarms yet — testable in a
browser.

### Deliverables — all in `SetList.html`
1. **Exercises**
   - Create / rename / delete exercises (default suggestions: "Push-ups", "Squats";
     user can add any).
   - Each exercise is independent.

2. **Per-exercise schedule**
   - Days of the week: pick any subset (e.g. Mon/Wed/Fri).
   - Times of day: up to 2 now (e.g. 7:00 AM, 2:00 PM); design data + UI so 3+ is a
     trivial future bump, not a rewrite.
   - Target sets × reps for the session (e.g. 2 × 10). Store sets and reps as separate
     numbers. Allow "no schedule" state (exercise exists but isn't scheduled yet — this
     is how Squats sits idle until the user is ready).
   - Editing the schedule is the progression mechanism. Changes take effect going
     forward; past history is unaffected.

3. **Today / Due view (home)**
   - Show today's scheduled sessions across all exercises, by time
     (e.g. "Push-ups — 2×10 — 7:00 AM").
   - Each due session has a big **Done** button and a **Skip** option.
   - Clearly show what's still due vs. already done today.

4. **Mark-done logging**
   - The ONLY session actions are Done and Skip. No rep/set entry.
   - Marking done records: exercise, date, scheduled time, the target (sets×reps) as it
     was at that moment, and status (done/skipped).

5. **Local persistence**
   - Exercises, schedules, and session records saved locally (see ARCHITECTURE).
   - Survives reload.

### Acceptance criteria
- Can create Push-ups, schedule it Mon/Wed/Fri at 7:00 AM + 2:00 PM, target 2×10.
- Squats can exist with no schedule and not appear in the Today view.
- Today view lists due Push-ups sessions at the right times; tapping Done records them.
- Editing Push-ups to 3×10 changes future sessions only; past records keep 2×10.
- Data persists across reload. Works with touch on Android Chrome.

---

## Phase 2 — PWA Foundation

**Goal:** Installable, offline-capable app.

### Deliverables
- `manifest.json` — name "SetList", standalone, start_url `./SetList.html`, theme/bg
  per chosen palette, icons 192×192 and 512×512.
- `sw.js` — cache-first app shell, cache `setlist-v1`, pre-cache app shell + assets.
- Register SW + link manifest in `SetList.html` (additive only).

### Acceptance criteria
- "Add to Home Screen" works; launches standalone; loads offline after first visit.

---

## Phase 3 — Reminders (native-alarm helper)

**Goal:** Reliable nudges via the phone's Clock app; SetList is not the alarm engine.

### Deliverables
- Each schedule's times are shown as reference for setting native alarms.
- "Set a matching alarm" affordance: Android `AlarmClock.ACTION_SET_ALARM` intent button
  where supported (feature-detect), with a plain on-screen instruction fallback always
  present.
- Short UI line explaining the model.

### Explicitly NOT doing
- No Notification permission for reminders; no service-worker notification scheduling;
  no Notification Triggers API.

### Acceptance criteria
- User sees each schedule's times and can set matching native alarms easily.
- UI clearly states real reminders come from the phone's Clock app.

---

## Phase 4 — History & Progression View

**Goal:** See consistency and progression without ever having logged a rep.

### Deliverables
- History list per exercise: date, time, target at that time, done/skipped.
- Simple progression readout: how the target has changed over time, plus a
  done/skipped streak or completion rate. Lightweight; inline SVG sparkline OK, no
  chart library unless justified.

### Acceptance criteria
- History reflects marked sessions accurately, including the historical target values.

---

## Phase 5 — Polish & Backup

### Deliverables
- Export all data to JSON (download) and import back.
- Edit/delete past session records.
- Empty-state and first-run guidance.
- Accessibility pass (contrast, tap targets, reduced-motion).

### Acceptance criteria
- Export → wipe → import round-trips with no data loss.

---

## Phase 6 — (Optional) Scheduled Future Changes

Only if the user later wants to pre-plan progression rather than edit live.

### Notes
- Allow a schedule to carry future-dated overrides: "on <date>, target becomes 3×10."
- Strictly user-authored; still never algorithmic. Design the data model in Phase 1 so
  this is additive (e.g. schedules can hold an optional list of dated changes).

---

## Phase 7 — (Optional) Native APK via Capacitor

Only if guaranteed alarm scheduling becomes a hard requirement. Wrap the single-file
web app; use a native local-notifications/alarm plugin. Web app stays source of truth.

---

## File Structure (target)

```
SetList/
├── SetList.html              # Main app (single file, all phases)
├── manifest.json             # Phase 2
├── sw.js                     # Phase 2
├── icons/
│   ├── icon-192.png          # Phase 2
│   └── icon-512.png          # Phase 2
└── Documentation/
    ├── IMPLEMENTATION_PLAN.md   ← this file
    ├── CLAUDE.md
    ├── ARCHITECTURE.md
    └── CHANGELOG.md
```

---

## Out of Scope (for now)
- Cloud sync / accounts; social / sharing / leaderboards.
- Per-set or per-rep logging (deliberately excluded — mark-done only).
- Algorithmic progression / auto-generated programs.
- Weighted-lifting features (plate math, 1RM).
- iOS Safari support.
