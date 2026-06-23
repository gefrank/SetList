# Changelog

All notable changes to SetList are recorded here.
Format loosely follows Keep a Changelog; versions follow SemVer-ish intent.

---

## [0.2.0] — PWA foundation
### Added
- `manifest.json` — installable as "SetList", `display: standalone`, portrait,
  `start_url` and `scope` relative (`./`) so it works from a GitHub Pages subpath.
  Twilight colors (background `#F5F6FA`, theme `#4C5FD5`) and 192/512 icons,
  including a maskable variant.
- `sw.js` — cache-first service worker, cache `setlist-v1`, pre-caches the app
  shell (SetList.html, manifest.json, both icons). Cleans old caches on activate
  and falls back to the shell for offline navigations. All paths relative.
- `icons/` — `icon.svg` master plus `icon-192.png` / `icon-512.png`, rendered in
  the twilight theme (indigo gradient, mist card, indigo check).
- `SetList.html` (additive only): links the manifest + apple-touch-icon and
  registers the service worker on load, behind feature detection. No change to
  existing functionality or layout.

### Notes
- Reminders/alarms still to come (Phase 3).

---

## [0.1.0] — Core app
### Added
- `SetList.html` — the whole Phase 1 app in one file, no build step, no dependencies.
- Exercises: create / rename / delete, each independent. First run seeds Push-ups
  and Squats as unscheduled suggestions.
- Per-exercise schedule: pick any subset of weekdays, up to 2 times of day (data model
  allows 3+), and a target sets × reps. A "Scheduled" toggle gives the "no schedule"
  idle state (Squats sitting out until you're ready).
- Today / due view: today's sessions across all exercises, sorted by time, with a big
  Done button and a Skip option; marked sessions show their state with an Undo.
- Mark-done logging: Done / Skip only — no per-set/per-rep entry. Each record snapshots
  the exercise name and target (sets × reps) at mark time, so editing or deleting an
  exercise never rewrites past history. Re-marking a slot updates its record instead of
  duplicating it.
- Due-session computation as a pure function (date + exercises + records → sorted slots
  tagged done / skipped / pending), per ARCHITECTURE.
- Local persistence via the `store` abstraction over localStorage (keys for exercises,
  records, settings, schema version); survives reload.
- UI: Twilight palette (indigo + mist) with light/dark via `prefers-color-scheme`,
  system font stack with tabular numerals, reduced-motion respected, 48px+ tap targets.

### Notes
- No PWA install, service worker, or alarms yet (Phases 2–3).

---

## [0.0.0] — Documentation & scaffold
### Added
- Project documentation: CLAUDE.md, IMPLEMENTATION_PLAN.md, ARCHITECTURE.md.
- Core concept: per-exercise independent standing schedules (days, times, sets×reps);
  exercises (e.g. Push-ups, Squats) scheduled separately; "no schedule" idle state.
- Session model: user marks each due session DONE or SKIPPED — no per-set/per-rep
  logging. Progression is by editing the schedule, never algorithmic.
- Data model: Exercise (with embedded schedule), SessionRecord (snapshots target at
  completion), due-session computation as a pure function.
- Reminder model: native phone Clock alarms are the nudge; SetList stores times for
  display and helps set matching alarms (no web-notification scheduling).
- Phased plan with optional future layers: scheduled future changes (Phase 6) and
  Capacitor native APK (Phase 7).

### Next
- Phase 1: build core `SetList.html` — exercises, per-exercise schedules, Today/due
  view, mark-done, local persistence.
