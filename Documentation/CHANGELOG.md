# Changelog

All notable changes to SetList are recorded here.
Format loosely follows Keep a Changelog; versions follow SemVer-ish intent.

---

## [0.3.2] — Reminders: Add to Google Calendar
### Changed
- Replaced the Set alarm helper with **Add to Google Calendar**. On a real Android
  device the `ACTION_SET_ALARM` web intent did nothing (the Clock app doesn't handle
  it, and the repeat-days array can't ride a web intent URL), so the alarm path was
  dead. The new button opens Google Calendar over plain `https` via the
  render-template URL with a **recurring event** prefilled:
  - `text` = "<name> — <sets>×<reps>" (e.g. "Push-ups — 2×10")
  - `dates` = next upcoming matching day at the scheduled time, 15-minute span, in
    the user's local time (`YYYYMMDDTHHMMSS/…`)
  - `recur` = `RRULE:FREQ=WEEKLY;BYDAY=…` from the schedule's days (Mon/Wed/Fri →
    `MO,WE,FR`)
  - `details` = "Logged in SetList"
- Helper text rewritten: tapping opens Calendar with a recurring event prefilled —
  review and Save; Calendar handles reminders. Notes plainly that it's **one-way**
  (editing a schedule later won't change an already-saved event).
- New `calendar` module (replaces `reminders`) with pure, unit-tested helpers:
  `byDay`, `nextMatchingDate`, `stampLocal`, `eventDates`, `eventUrl`.
- Service worker cache bumped `setlist-v3` → `setlist-v4` so the update reaches
  installed devices.

### Removed
- The non-functional Set alarm intent button and its Clock-app / Repeat-toggle text.

---

## [0.3.1] — Reminders: recurring-day guidance
### Changed
- Set alarm helper now points at the exercise's repeat days. The weekday list is
  baked into the alarm name (e.g. "SetList — Push-ups (Mon, Wed, Fri)") and a live
  line tells the user to turn on Repeat for exactly those days when the Clock app
  opens. The day list updates as days/name/times are edited.
- Service worker cache bumped `setlist-v2` → `setlist-v3` so the update reaches
  installed devices.

### Why not EXTRA_DAYS directly
- `AlarmClock.EXTRA_DAYS` is an `ArrayList<Integer>` of Calendar constants
  (Sun=1 … Sat=7), settable only from native code via `putIntegerArrayListExtra`.
  A web PWA can only reach the Clock app through a Chrome `intent:` URL, and that
  URI format (`Intent.toUri`/`parseUri`) encodes **only scalar** extras — arrays
  are silently dropped before they reach the Clock app. So a true recurring system
  alarm can't be created from the web; the label + Repeat hint is the honest path
  (two taps to a recurring alarm). The Calendar mapping (index + 1) is documented
  in code for a future native build (Phase 7), where EXTRA_DAYS would work.

---

## [0.3.0] — Reminders (native-alarm helper)
### Added
- `reminders` module in `SetList.html`: builds an Android `ACTION_SET_ALARM`
  `intent:` URL (hour, minute, and a "SetList — <exercise>" label) and hands each
  planned time to the phone's Clock app. Pure URL builder + a try/catch launcher
  and an Android check.
- Edit Exercise screen now shows a Reminders section: one "Set alarm" button per
  scheduled time, a short line explaining the model, and an always-visible
  fallback instruction to add alarms by hand. Off Android, the button explains the
  manual route instead of firing a dead link. Rows stay in sync as times/name are
  edited.

### Changed
- Service worker cache bumped `setlist-v1` → `setlist-v2` so the update actually
  reaches installed devices instead of being served from the old cache.

### Explicitly NOT done (by design)
- No web Notification permission, no service-worker notification scheduling, no
  Notification Triggers API. Native phone alarms are the only reminder mechanism.

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
