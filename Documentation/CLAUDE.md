# CLAUDE.md — SetList Project Instructions

This file guides Claude Code when working on the SetList project. Read it in full
before doing anything else, then read IMPLEMENTATION_PLAN.md and ARCHITECTURE.md.

---

## Project Overview

SetList is a mobile-first Progressive Web App for Android (Chrome) that lets the user
schedule their own bodyweight exercises (push-ups, squats, and any custom exercise),
each on its own independent schedule, and mark each scheduled session **done** when
finished. No build toolchain — pure HTML/CSS/JS, single-file app architecture (all
code in `SetList.html` unless a file genuinely must be separate).

**Primary user:** Gordo, working from his PC in VS Code (`C:\Users\gefra\Repos\SetList`),
deploying to Android Chrome via "Add to Home Screen."

---

## Core Concept — read this first

The mental model is **per-exercise standing schedules**, NOT bundled routines.

- Each **exercise** (e.g. Push-ups, Squats) has its OWN schedule, independent of others.
- A schedule = which **days of the week**, which **times of day** (up to 2 now; design
  for 3+ later), and the **target sets × reps** for each session.
- Push-ups and Squats are scheduled separately. The user can run Push-ups only and leave
  Squats unscheduled until they're ready to add it.
- **Logging is dead simple: the user marks a session DONE.** No per-set tracking, no
  rep entry, no tapping through sets mid-workout. The app tells the user the target; the
  user does it away from the phone; they tap Done (or Skip) afterward.
- **Progression happens by EDITING the schedule**, not by an algorithm. The app NEVER
  decides reps for the user. Example progression the user actually wants:
  start Push-ups at 2×10 AM/PM with no squats; hold for a couple weeks; then add a
  Squats schedule and bump Push-ups to 3×10 — all by hand, all adjustable anytime.

### What SetList is NOT
- NOT an algorithmic trainer. It never auto-increments reps or imposes a curve.
- NOT a per-rep/per-set logger. "Mark done" is the only session action (plus skip).
- NOT a bundled-routine app. Exercises are scheduled independently, not grouped.

---

## Architecture Principles

- **Single HTML file** for the app shell (`SetList.html`). Only the service worker
  (`sw.js`) and manifest (`manifest.json`) live as separate files.
- **No build step, no npm, no bundler.** CDN imports only; prefer zero dependencies
  (this app needs none for core functionality).
- **No frameworks.** Vanilla JS with DOM manipulation. No React, no Vue.
- **Offline-first.** Everything works without a network connection after first load.
- **Touch-first.** Large tap targets, high contrast, usable at a glance. But the app is
  explicitly NOT meant to be held during a workout — the primary in-session action is a
  single big "Done" button used afterward.
- **Local-only data.** No accounts, no cloud, no telemetry. Data lives on the device.

---

## Aesthetic

Do NOT reuse the BookLens amber/ink palette — this is a separate app and should look
distinct. Before writing UI code, propose a palette and type choice in the chat and get
sign-off. Constraints: high-contrast, calm, legible at a glance. A restrained,
slightly meditative feel suits the user. Avoid loud "gym" styling.

---

## Reminders — design decision

Native phone clock alarms are the reminder mechanism. SetList does NOT schedule
notifications itself (web scheduling on Android Chrome is unreliable — evicted service
workers, uneven Notification Triggers support). Each exercise schedule stores its
times for display, and the app helps the user set matching native alarms.

- A schedule's times are **display/reference** for setting native alarms; the app does
  not fire them itself.
- Provide a "set a matching alarm" affordance: an Android `AlarmClock.ACTION_SET_ALARM`
  intent button where it works (feature-detect), with a plain on-screen instruction
  fallback always present.
- Do NOT request Notification permission for reminders; no service-worker scheduling.
- A short UI line makes the model explicit: SetList shows planned times; set matching
  alarms in the phone's Clock app for reliable reminders.

If guaranteed in-app scheduling is ever wanted, that's a Capacitor → native APK path
(Phase 6, optional). Not needed for the current design.

---

## Working Style

- Additive, incremental changes. Don't refactor working code without a reason.
- After completing a phase, update CHANGELOG.md and mark the phase complete below.
- Ask before introducing any new file or dependency.

---

## Phase Status

| Phase | Description                              | Status      |
|-------|------------------------------------------|-------------|
| 0     | Documentation + project scaffold         | Complete    |
| 1     | v0.1 core: exercises, schedules, mark-done| Complete    |
| 2     | PWA foundation (manifest, sw, icons)     | Complete    |
| 3     | Reminders (native-alarm helper)          | Complete    |
| 4     | History & progression view               | Not started |
| 5     | Polish, export/backup                    | Not started |
| 6     | (Optional) scheduled future changes      | Not started |
| 7     | (Optional) Capacitor → native APK        | Not started |
