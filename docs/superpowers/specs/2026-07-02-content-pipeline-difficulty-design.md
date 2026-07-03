# Content Pipeline + Difficulty-Aware Gameplay — Design Spec

**Date:** 2026-07-02
**Status:** Approved by Robin (design conversation, 2026-07-02)
**Scope:** Frontend (React game) + a Node build script. No backend changes.

## Overview

The question bank was recently expanded from 98 to ~307 questions across 15 modules, sourced
from `questions/ifrs17_questions_choices_explanations excel database.csv`. That expansion is
currently a manual, lossy copy: the CSV's Complexity column (Beginner/Standard/Expert) is
dropped, and the CSV and `src/data/IFRS17Modules.js` can silently drift apart.

This project makes the CSV the single source of truth via a generation script, carries the
difficulty dimension into gameplay (weighted XP, difficulty badge, banded question ordering),
restores power-ups (which currently have state but no UI), and adds a post-module review of
missed questions.

## Goals

1. CSV → JS generation script so content updates are a spreadsheet edit, not a code edit.
2. Preserve and use question difficulty in the game loop.
3. Restore usable power-ups (Eliminate, Hint); remove the dead `skip` concept.
4. Let learners review the questions they got wrong after completing a module.
5. Correct stale documentation (README, FAQ) and inconsistent power-up defaults.

## Non-Goals (explicitly out of scope)

- Leaderboard schema or scoring-comparability changes (score formula is unchanged).
- Chatbot roadmap items (`docs/CHATBOT_ENHANCEMENTS.md`).
- Supabase project cutover (Vercel/Render env update) — separate ops task.
- Accessibility overhaul — deserves its own dedicated pass.
- Cross-session persistence of missed-question history (review is session-level only).

## 1. CSV → JS Content Pipeline

**Script:** `scripts/generate-modules.js`, run via `npm run generate:questions`.

- **Input:** `questions/ifrs17_questions_choices_explanations excel database.csv`
  (columns: Module No, Module Name, Complexity, Question, Option 1–4, Correct Answer,
  Explanation). The CSV is committed to the repo.
- **Output:** `src/data/IFRS17Modules.js`, overwritten in place, with a header comment
  marking it as generated ("GENERATED FILE — edit the CSV and run
  `npm run generate:questions`; do not hand-edit"). The generated file remains committed
  because CRA imports it at build time.
- **Parsing:** papaparse as a devDependency. Question text contains commas, quotes, and
  line breaks; no hand-rolled CSV parsing.
- **Validation (fail-loud):** the script exits non-zero and writes nothing if any row fails:
  - exactly 4 non-empty options;
  - Correct Answer resolvable to an option index 0–3 (accepts a 1–4 number or an exact
    option-text match);
  - non-empty Question and Explanation;
  - Complexity ∈ {Beginner, Standard, Expert} (case-insensitive);
  - Module No maps to a known module (1–15).
  All failing rows are reported with their CSV row numbers in one pass.
- **Question shape:** existing fields (`question`, `options[4]`, `correct`, `explanation`)
  plus new `difficulty: 'beginner' | 'standard' | 'expert'`.
- **Module metadata** (title, icon, color, description) is not in the CSV; the script keeps
  a small metadata map (extracted from the current `IFRS17Modules.js`) keyed by module number.
- **Acceptance for first run:** regenerated output is diffed against the current
  `IFRS17Modules.js`. Expected diffs: the new `difficulty` field and the generated-file
  header. Any other diff indicates the manual import drifted from the CSV — each such
  discrepancy is reviewed against the CSV (which wins as source of truth) and noted in the
  commit message before committing.

## 2. Difficulty in the Game Loop

- **Score is unchanged:** `10 × (combo + 1)` per correct answer. Existing leaderboard
  entries stay comparable; no reset or archival needed.
- **XP becomes difficulty-weighted:** Beginner 25, Standard 35, Expert 50 (replaces the
  flat 25). Weights live in `GAME_CONFIG.XP_BY_DIFFICULTY`.
- **Missing difficulty defaults to `'standard'`** everywhere it is read, so stale data can
  never crash the game.
- **Difficulty badge** on the question card in `QuestionPanel`: color-coded chip
  (green = Beginner, amber = Standard, red = Expert).
- **Banded ordering:** within a module, questions are grouped Beginner → Standard → Expert
  and Fisher–Yates-shuffled *within* each band (replaces the current full-module shuffle in
  `useQuestionFlow.js`). Modules ramp up in difficulty while retaining replay variety.

## 3. Power-Ups: Restore Two, Remove One

Today `src/modules/powerUps.js` defines only `skip`, no power-up UI exists in the live
`QuestionPanel`, and defaults disagree across four files. This design:

- **Eliminate — 2 per module.** Removes two incorrect options from the current question
  (visually disabled/hidden). One use per question maximum.
- **Hint — 3 per module.** Opens the chat panel (existing `onAskHelp` plumbing) and
  automatically sends the message "Give me a hint for this question, without revealing the
  answer." The count decrements when the message is sent, at most once per question. The
  backend already receives the current question and its explanation via `game_context`, so
  no backend change is required.
- **Skip is removed entirely:** from `powerUps.js`, state initialization, persistence
  payloads, and all copy. Unknown keys in previously saved power-up state are ignored on
  load (no migration required).
- **Allowance and refresh:** counts reset to full at module start via the existing
  `refreshPowerUps` path. No carry-over between modules.
- **No score penalty** for power-up use; scarcity is the balance lever. Power-up use does
  **not** disqualify a perfect module (perfect = zero wrong answers).
- **Single source of defaults:** `GAME_CONFIG.POWER_UPS = { eliminate: 2, hint: 3 }` in
  `src/config/gameConfig.js`. The divergent literals in `useGameUIActions.js`,
  `authService.js`, `storageService.js`, and `supabaseService.js` are replaced with
  references to it.
- **UI:** a small power-up bar in `QuestionPanel` showing each power-up with remaining
  count; disabled at zero or after the question is answered.

## 4. Review Missed Questions

- `useQuestionFlow` records the indices of wrong-answered questions for the current module
  (first attempt only; review answers are never recorded).
- On module completion, `ModuleCompleteModal` shows **"Review missed questions (n)"** when
  n > 0, alongside the existing continue action.
- **Review mode:** replays only the missed questions in order. No scoring, no XP, no combo,
  no timer, no power-ups; the explanation is always shown after answering. A visible
  "Review mode" indicator distinguishes it from normal play. Exiting review (finishing the
  list or pressing a close/back control) returns to the module-complete state, and the
  normal continue flow proceeds from there.
- Review state is session-level React state only — it is not persisted and does not touch
  Supabase or localStorage.

## 5. Housekeeping (rides along)

- README: 15 modules, ~307 questions, actual power-up list (Eliminate, Hint), difficulty
  tiers mentioned.
- `GameGuideFAQ.js`: perfect module redefined as "no wrong answers"; power-up help text
  updated; skip references removed.
- Generated-file header comment added to `IFRS17Modules.js` (via the script).

## 6. Error Handling

- **Generator:** all validation failures reported in one pass with row numbers; exits
  non-zero; never writes a partial file.
- **Game:** `difficulty` read through a helper that defaults to `'standard'`; power-up
  actions are no-ops when count is zero; loading a save containing `skip` counts ignores
  the unknown key.

## 7. Testing

- **Generator (Jest, run in Node):** validation rejection cases (bad correct answer,
  missing explanation, unknown complexity, wrong option count), correct-answer resolution
  by number and by text, and a golden test on a small fixture CSV.
- **`useQuestionFlow`:** weighted XP by difficulty, flat score unchanged, banded ordering
  (all beginners before all standards before all experts), missed-question recording, and
  review-mode entry/exit not affecting score/XP.
- **Power-ups:** eliminate removes exactly two wrong options and never the correct one;
  counts decrement and stop at zero.
- **Manual smoke:** guest Module 1 flow (deferred auth) unaffected; resume from a pre-change
  save works.

## Decision Log

| Decision | Choice | Alternative rejected |
|---|---|---|
| Difficulty scoring | Flat score + weighted XP | Fully weighted score (would invalidate existing leaderboard entries) |
| Question order | Shuffle within difficulty bands | Full-module shuffle (no pedagogical ramp); fixed order (no replay variety) |
| Skip power-up | Removed | Restoring it (conflicts with perfect-module definition; timer/review edge cases) |
| Power-up cost | Free to use, scarce supply | Score penalties (added complexity, unclear learner benefit) |
| Review persistence | Session-only | Persisted review history (YAGNI for now) |
| CSV parser | papaparse devDependency | Hand-rolled parser (fragile against embedded commas/quotes/newlines) |
