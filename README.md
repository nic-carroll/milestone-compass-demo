# Milestone Compass (Demo)

A prototype of a standards-aligned, adaptive K-12 practice platform for
Georgia schools. Students log in, pick a class, choose which standards to
focus on and how hard the questions should be (Depth of Knowledge), and get
instant feedback explaining *why* every answer choice is right or wrong.
Includes a teacher-facing dashboard and a simplified adaptive practice mode.

**This is a demo/prototype, not a production tool.** Everything you can
click through works end-to-end, but the content behind it is intentionally
fake in specific, clearly-labeled ways — see "What's real vs. sample data"
below before assuming any of it.

## Try it

- **Live demo:** _(GitHub Pages link goes here once enabled)_
- **Run locally:**
  ```bash
  git clone https://github.com/nic-carroll/milestone-compass-demo.git
  cd milestone-compass-demo
  python3 -m http.server 5173
  # open http://localhost:5173
  ```
  No build step, no dependencies — plain HTML/CSS/JS.

## What you can try

- Log in as any name → pick a class → see its standards → build a practice
  set (choose standards, question count, difficulty, question types) →
  answer questions → get an explanation for **every** answer choice, right
  or wrong, not just the one you picked.
- Toggle "Adaptive practice (beta)" in the builder to see difficulty step up
  or down question-by-question based on your last answer.
- "My Progress" tracks accuracy per standard and per difficulty level over
  time, in this browser only.
- "Viewing as a teacher instead?" (a link on the login screen) shows a real
  student × standard heatmap for whichever demo students have actually
  practiced in this browser — not a fabricated class roster.

## What's real vs. sample data

- Login is name-only — no real accounts, no real district integration yet.
- Class rosters, standards, and questions are all hand-authored sample
  content, **not** pulled from a real school system, Georgia's real CASE
  standards network, or any vendor question bank. See `data.js`'s header
  comment and `CLAUDE.md` for the full breakdown of what's real vs.
  illustrative in this build.
- "Adaptive practice" is a simple heuristic (step difficulty up/down based
  on the last answer) — explicitly **not** real IRT-based computerized
  adaptive testing, which needs calibration data this demo doesn't have.
- Achievement-level labels ("Beginning/Developing/Proficient/Distinguished
  Learner") reuse Georgia's real Milestones level *names*, but the
  thresholds are this demo's own illustrative accuracy bins — not Georgia's
  actual Milestones cut scores.

## Feedback

This is an early prototype and feedback is very welcome — please
[open an issue](../../issues) with what you tried, what confused you, or
what you'd want to see next.

## Background

This started as a planning exercise for a standards-aligned assessment
platform and grew after a companion design spec ("Milestone Compass")
sketched a fuller vision — adaptive delivery, growth tracking, teacher and
district dashboards. `CLAUDE.md` has the full project history, what's
built vs. still open, and the reasoning behind each design decision.

## License

MIT — see [LICENSE](LICENSE).
