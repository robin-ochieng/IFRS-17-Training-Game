# IFRS 17 Training Game – Question Bank Migration & Tournament Feature Plan

_Last updated: 2026-01-11_

## 1. Purpose & Scope

This document defines a phased, production-ready plan for:

- Migrating all IFRS 17 game questions from the current Excel source (Game Questions/`ifrs17_questions_choices_explanations.xlsx`) and hardcoded frontend file (`src/data/IFRS17Modules.js`) into the database.
- Introducing **question complexity** (`Beginner`, `Standard`, `Expert`) as a first-class concept used by the game engine.
- Laying the groundwork and detailed design for a **Tournament** feature built on top of the new question bank and difficulty system.

The plan is designed so that each phase can be implemented, tested, and deployed incrementally, minimizing risk while keeping the game playable at every step.

---

## 2. Current State Overview

### 2.1 Question Storage

- Frontend questions are currently stored in:
  - `src/data/IFRS17Modules.js` – an exported `modules` array containing modules, each with a `questions` array.
- Authoritative content is also maintained in an Excel workbook:
  - `Game Questions/ifrs17_questions_choices_explanations.xlsx`
  - Structure (based on screenshots):
    - `Module No`
    - `Module Name`
    - `Complexity (Beginner, Standard, Expert)`
    - `Question`
    - `Option 1` – `Option 4`
    - `Correct Answer` (text)
    - `Explanation`

### 2.2 Backend & Persistence

- Database tables already exist for:
  - `users`, `leaderboard`, `module_leaderboard`, `game_progress`, `module_completions`, `progress_events`, etc.
- Supabase is used for hosting Postgres and exposing RLS-secured tables.
- The backend (FastAPI) already exposes APIs for the chatbot and persistence but **not yet** for questions.
- The frontend imports questions directly from the static JS data file and does not yet make API calls to retrieve question content.

### 2.3 Constraints & Goals

- Do **not** break the existing game flow while the migration is in progress.
- Maintain a **single source of truth** for questions after migration (database, not JS/Excel).
- Support future features:
  - Adaptive difficulty.
  - Question-level analytics.
  - Tournaments (time-bound, competitive play).

---

## 3. Target Architecture (High-Level)

After the migration and enhancements, the question subsystem will look like this:

- **Database**
  - `modules` table: metadata about each IFRS 17 module.
  - `questions` table: question text, options, correct answer, explanation, complexity, scoring metadata.
  - Optional extension tables for analytics (e.g. `question_stats`) and tournaments (see Section 8).

- **Backend (FastAPI)**
  - Question service layer that:
    - Serves module/question data to the frontend via REST endpoints.
    - Supports filters for module, complexity, status (active/inactive).
    - Provides admin ingestion endpoints (optional) for bulk import/maintenance.

- **Frontend (React)**
  - Game engine retrieves questions from the backend and caches them locally.
  - Uses `complexity` to drive difficulty selection, scoring, and adaptive progression.
  - Tournament flows use the same question service but with tournament-specific rules and timing.

---

## 4. Phase 0 – Prerequisites & Environment

### 4.1 Environment Alignment

- Confirm Supabase and local Postgres schemas are in sync by running:
  - `complete-database-setup.sql` (local/dev)
  - Existing Supabase SQL scripts (`supabase-setup.sql`, `complete-persistence-setup.sql`, migrations).
- Ensure backend environment is working:
  - Backend server starts successfully (FastAPI app).
  - Existing API routes (`/health`, chatbot) are passing tests in `backend/tests`.

### 4.2 Data Source Freeze Policy

- Decide a **cutoff date** after which the Excel workbook is considered read-only for question content.
- All future edits should eventually be made via DB-backed admin tools (future phase) or controlled SQL/data scripts.

---

## 5. Phase 1 – Database Design for Question Bank

### 5.1 New Core Tables

#### 5.1.1 `modules`

Purpose: Represent each IFRS 17 module as a distinct, queryable entity; decouple module metadata from questions.

Proposed schema (logical – final SQL may vary slightly):

- `id` (SERIAL, PK)
- `module_number` (INTEGER, UNIQUE, maps to Excel `Module No` and frontend module index)
- `name` (TEXT, NOT NULL)
- `description` (TEXT, nullable)
- `icon` (TEXT, default e.g. `📚`)
- `color` (TEXT, default e.g. `from-blue-500 to-blue-600`)
- `is_active` (BOOLEAN, default TRUE)
- `sort_order` (INTEGER, optional; explicit ordering if needed)
- `created_at`, `updated_at` (TIMESTAMPTZ, default NOW())

#### 5.1.2 `questions`

Purpose: Store every question, its answers, and metadata in a normalized structure.

- `id` (SERIAL, PK)
- `module_id` (INTEGER, FK → `modules.id`)
- `question_text` (TEXT, NOT NULL)
- `option_1` – `option_4` (TEXT, NOT NULL)
- `correct_option` (SMALLINT, NOT NULL, CHECK 1–4)
- `explanation` (TEXT)
- `complexity` (TEXT, NOT NULL, default `Standard`, CHECK IN ('Beginner', 'Standard', 'Expert'))
- `points_value` (INTEGER, default 10; allows higher rewards for higher complexity)
- `time_limit_seconds` (INTEGER, default 30; may be shorter for higher complexity in tournaments)
- `is_active` (BOOLEAN, default TRUE)
- `sort_order` (INTEGER; order within module)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 5.2 Optional Supporting Tables (Future Enhancements)

- `question_stats` (optional): per-question performance metrics.
  - `question_id`, `attempts`, `correct_attempts`, `avg_response_time`, `last_used_at`.
- `question_tags` / `question_topics`: classification beyond module (e.g., `Discounting`, `Risk Adjustment`).

### 5.3 RLS and Access Control

- For typical players:
  - `SELECT` on `modules` and `questions` allowed for `anon` and `authenticated` (read-only).
- For admin tooling:
  - `INSERT`/`UPDATE`/`DELETE` restricted to a specific role or `service_role` key.
- Carefully design policies so that players **cannot manipulate questions or answers**.

### 5.4 Migration Script Location

- Add a new SQL migration file under `migrations/`, e.g.:
  - `migrations/2026-01-questions_schema.sql`
- Keep Supabase and local migrations consistent by applying the same script in both environments.

---

## 6. Phase 2 – Data Migration from Excel to Database

### 6.1 Mapping Excel → Database

For each row in the `IFRS17 Questions` sheet:

- `Module No` → `modules.module_number`
- `Module Name` → `modules.name`
- `Complexity` → `questions.complexity`
- `Question` → `questions.question_text`
- `Option 1`–`Option 4` → `questions.option_1`–`option_4`
- `Correct Answer` (text) → Map to correct option index:
  - Compare `Correct Answer` text against each `Option X`.
  - If one match is found → `correct_option = X`.
  - If multiple or zero matches → flag for manual review.
- `Explanation` → `questions.explanation`

### 6.2 Migration Tooling

Implement a standalone Python migration script (can live under `backend/data` or `scripts/`), e.g. `migrate_questions_from_excel.py`:

1. **Read Excel** using `pandas` and `openpyxl`.
2. Normalize and trim whitespace.
3. Build in-memory maps:
   - `(module_number, module_name) → module_id` (create if not present).
4. Insert or upsert modules.
5. Insert questions for each module, assigning `sort_order` based on row order.
6. Log and export any inconsistencies to a CSV/JSON report (e.g., unmatched correct answers).

### 6.3 Validation Steps

- Before inserting into production:
  - Run the script against a **dev database**.
  - Randomly sample N questions and compare:
    - Database vs Excel.
    - Database vs existing JS questions (where they overlap).
  - Automate a consistency check script that:
    - Ensures every `Correct Answer` maps to exactly one of the options.
    - Ensures every module in Excel has a corresponding `modules` row.

- After importing into production/Supabase:
  - Run read-only queries to confirm counts:
    - Total questions per module.
    - Distribution by `complexity`.

### 6.4 De-duplication & Versioning

- Keep the existing JS question file **intact** during early phases as a rollback/fallback.
- Introduce a `questions.version` or `source` column if future multiple versions are expected.
- Plan a cutoff date after which the JS file is no longer considered authoritative.

---

## 7. Phase 3 – Backend Question Service API

### 7.1 API Design Principles

- Keep endpoints **simple and cache-friendly**.
- Support both:
  - Bulk fetches (e.g., all questions for a module at game start).
  - On-demand fetch (e.g., one question at a time, filtered by complexity).
- Ensure all endpoints respect RLS and avoid exposing sensitive data.

### 7.2 Core Endpoints

1. `GET /api/modules`
   - Returns a list of all active modules with:
     - `id`, `module_number`, `name`, `description`, `icon`, `color`.
   - Query parameters:
     - `active_only` (default `true`).

2. `GET /api/modules/{module_id}/questions`
   - Returns questions for a given module.
   - Query parameters:
     - `complexity` (one or more of `Beginner,Standard,Expert`).
     - `limit`, `offset` (for pagination).
     - `active_only` (default `true`).
     - `random` (bool) to shuffle the order server-side (important for tournaments).

3. `GET /api/questions/random`
   - Parameters:
     - `module_id` (optional; if omitted, select from all modules).
     - `complexity` (optional; default configured by game mode).
   - Returns a single randomized question.

4. (Optional, later) Admin-only endpoints:
   - `POST /api/questions` – create a new question.
   - `PUT /api/questions/{id}` – update.
   - `DELETE /api/questions/{id}` – soft delete or deactivate.

### 7.3 Response Shape

Standardized JSON for questions:

```json
{
  "id": 123,
  "module_id": 1,
  "question_text": "What is the primary objective of IFRS 17?",
  "options": [
    "To standardize insurance accounting globally",
    "To replace IFRS 16",
    "To define financial instruments",
    "To measure investment property"
  ],
  "correct_option": 1,
  "explanation": "IFRS 17 aims to create a consistent...",
  "complexity": "Beginner",
  "points_value": 10,
  "time_limit_seconds": 30
}
```

### 7.4 Integration with Existing Backend

- Extend `backend/app/api/routes.py` with a new router section:
  - `router.get("/modules")`, `router.get("/modules/{id}/questions")`, etc.
- Add service/data-access layer functions (e.g., `app/core/questions_service.py`) to encapsulate SQL/ORM calls.
- Write unit tests under `backend/tests/test_api.py` or a new `test_questions_api.py` file.

---

## 8. Phase 4 – Frontend Integration & Game Logic Refactor

### 8.1 Data Access Layer on Frontend

- Create `src/modules/questionsService.js` (or similar) that:
  - Wraps API calls to the backend question endpoints.
  - Normalizes responses to a structure compatible with existing game logic.
  - Implements simple caching in memory (and, optionally, localStorage for offline/guest play).

### 8.2 Refactoring Question Loading

- Replace direct imports from `src/data/IFRS17Modules.js` with calls to `questionsService`:
  - At game start, fetch modules and questions for the current module.
  - For offline/guest mode, optionally keep a **small, curated subset** of questions in JS as fallback.

### 8.3 Incorporating `complexity` into Gameplay

- Expose complexity in the React state for current question:
  - Use it to adjust:
    - Timer length.
    - Score multiplier.
    - Visual difficulty indicators (e.g., color badges, icons).

- Add **game mode configurations** in `src/config/gameConfig.js`, e.g.:
  - `trainingMode`: `allowedComplexities = ['Beginner']`.
  - `standardMode`: `['Beginner', 'Standard']`.
  - `challengeMode`: `['Standard', 'Expert']`.
  - `expertMode`: `['Expert']`.

### 8.4 Adaptive Difficulty (Optional but Recommended)

- Track per-session performance (correct rate, streak, response time).
- Simple rule-based adaptation:
  - If `correct_rate > 80%` and `streak >= 3` → next question complexity escalates (Standard → Expert).
  - If `correct_rate < 50%` → bias towards easier questions (Expert → Standard → Beginner).

### 8.5 Backward Compatibility & Fallbacks

- Maintain `IFRS17Modules.js` initially as a fallback:
  - If API fails, fall back to local static questions and log an error.
- Once DB-backed flow is stable in production, deprecate and eventually remove the static file, or keep only a tiny offline tutorial module.

---

## 9. Phase 5 – Scoring & Analytics Enhancements

### 9.1 Complexity-Aware Scoring Model

Recommended baseline mapping:

| Complexity | Base Points | Time Bonus Multiplier |
|-----------|------------|------------------------|
| Beginner  | 10         | 1.0x                   |
| Standard  | 15         | 1.5x                   |
| Expert    | 25         | 2.0x                   |

- Update the game scoring system to consider:
  - `points_value` column from DB.
  - Additional bonus based on speed and streaks.

### 9.2 Question-Level Analytics (Optional)

- Introduce `question_stats` table (see Section 5.2) and update it when users answer questions:
  - Increment `attempts` and `correct_attempts`.
  - Track `avg_response_time`.
- Use these stats to:
  - Identify poorly performing or ambiguous questions.
  - Balance tournaments (avoid overused questions).

---

## 10. Phase 6 – Tournament Feature Design

The tournament system will build on the migrated question bank and complexity metadata.

### 10.1 Tournament Use Cases

1. **Scheduled Tournaments**
   - Company-wide IFRS 17 challenges on specific dates.
   - Time-bound window (e.g., 30–60 minutes) with fixed question sets.

2. **On-Demand Tournaments**
   - Admins create ad-hoc tournaments for specific teams or cohorts.

3. **Difficulty-Bracketed Tournaments**
   - Beginner Cup (only Beginner questions).
   - Pro Challenge (Standard + Expert mix).
   - Expert Masters (Expert-only, higher stakes).

4. **Leaderboards & Rewards**
   - Per-tournament leaderboard.
   - Integration with existing global and module leaderboards (bonus points, achievements).

### 10.2 Tournament Database Schema (Proposed)

#### 10.2.1 `tournaments`

- `id` (BIGSERIAL, PK)
- `name` (TEXT)
- `description` (TEXT)
- `start_time` (TIMESTAMPTZ)
- `end_time` (TIMESTAMPTZ)
- `status` (TEXT: `scheduled`, `active`, `completed`, `cancelled`)
- `allowed_complexities` (TEXT[] – e.g., `['Beginner','Standard']`)
- `module_ids` (INTEGER[] – modules included; null = all)
- `question_count` (INTEGER – number of questions per participant)
- `time_per_question_seconds` (INTEGER – tournament-specific timer)
- `max_players` (INTEGER, optional)
- `created_by` (TEXT – admin id/email)
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### 10.2.2 `tournament_participants`

- `id` (BIGSERIAL, PK)
- `tournament_id` (FK → `tournaments.id`)
- `user_id` (TEXT – FK → `users.id`)
- `joined_at` (TIMESTAMPTZ)
- `status` (TEXT: `registered`, `playing`, `finished`, `disqualified`)

#### 10.2.3 `tournament_questions`

- Purpose: Freeze the question set (and ordering) for each tournament to ensure fairness.
- Columns:
  - `id` (BIGSERIAL, PK)
  - `tournament_id` (FK)
  - `question_id` (FK → `questions.id`)
  - `sort_order` (INTEGER)

Optionally, a per-participant mapping table (`tournament_player_questions`) can be used if each participant gets a randomized subset.

#### 10.2.4 `tournament_results`

- `id` (BIGSERIAL, PK)
- `tournament_id` (FK)
- `user_id` (TEXT)
- `score` (INTEGER)
- `correct_answers` (INTEGER)
- `total_questions` (INTEGER)
- `avg_response_time` (NUMERIC)
- `completed_at` (TIMESTAMPTZ)
- `rank` (INTEGER, computed after tournament close)

### 10.3 Tournament Backend APIs

1. **Public Player APIs**

   - `GET /api/tournaments` – list upcoming and active tournaments.
   - `GET /api/tournaments/{id}` – details, including rules and schedule.
   - `POST /api/tournaments/{id}/join` – register as a participant.
   - `GET /api/tournaments/{id}/questions` – fetch assigned question set.
   - `POST /api/tournaments/{id}/submit` – submit answers for scoring.
   - `GET /api/tournaments/{id}/leaderboard` – tournament-specific leaderboard.

2. **Admin APIs**

   - `POST /api/tournaments` – create a tournament (define modules, complexities, question counts, start/end time).
   - `PUT /api/tournaments/{id}` – update schedule or parameters.
   - `POST /api/tournaments/{id}/finalize` – lock results, compute ranks, trigger rewards.

### 10.4 Tournament Frontend UX

- **Tournament Lobby**
  - List of available tournaments with countdown timers and difficulty badges.
  - Ability to filter by `Beginner`, `Standard`, `Expert` or mixed.

- **Registration Flow**
  - Player joins tournament → confirmation, rules overview, and start time.

- **Play Session UI**
  - Strict per-question timer (progress bar).
  - Clear indication of question complexity and remaining questions.
  - Minimal navigation (no ability to go back to previous questions unless rules allow).

- **Results & Leaderboards**
  - Post-tournament screen with:
    - Player rank, score, accuracy, and average response time.
    - Comparison with company/global averages.
  - Integration with existing `leaderboard` and `module_leaderboard` tables for awarding extra points or achievements.

### 10.5 Fairness, Cheating & Reliability

- Use **server-side timing** (start/end timestamps) rather than purely client-side timers.
- Limit question visibility window during tournaments.
- Avoid reusing the exact same question order across tournaments; rely on `tournament_questions` or per-player variations.
- Consider simple anti-cheat heuristics:
  - Detect unrealistically fast perfect runs.
  - Flag multiple submissions from the same user within tight windows.

---

## 11. Phase 7 – Testing & Rollout Strategy

### 11.1 Testing Layers

- **Unit tests**
  - Backend question services and APIs.
  - Data migration scripts (e.g. mapping `Correct Answer` to option index).

- **Integration tests**
  - End-to-end flows: fetch questions → answer → score → persistence.
  - Tournament lifecycle: create → join → play → leaderboard.

- **UAT (User Acceptance Testing)**
  - Involve IFRS 17 SMEs to verify correctness and clarity of questions.
  - Validate that difficulty labels (`Beginner`, `Standard`, `Expert`) feel appropriate.

### 11.2 Rollout Plan

1. **Internal Beta (DB-backed questions only)**
   - Enable DB questions in a staging environment.
   - Keep JS questions as fallback.

2. **Production Rollout – Question Migration**
   - Switch game to read from DB by default.
   - Monitor error logs and analytics.

3. **Tournament Feature Pilot**
   - Run a small, internal tournament (e.g., 20–30 users).
   - Collect feedback on difficulty, timings, and UX.

4. **Full Tournament Launch**
   - Publicize tournaments to all users.
   - Introduce badges/achievements tied to tournament performance.

---

## 12. Implementation Roadmap (Summary)

A suggested high-level order of execution:

1. **Phase 1 – Schema**: Create `modules` and `questions` tables with RLS.
2. **Phase 2 – Migration**: Implement Excel → DB import; validate data.
3. **Phase 3 – Backend API**: Implement question and module endpoints, plus tests.
4. **Phase 4 – Frontend Integration**: Switch game to database-backed questions; leverage complexity.
5. **Phase 5 – Scoring & Analytics**: Introduce complexity-aware scoring and optional stats.
6. **Phase 6 – Tournaments**: Implement DB schema, backend APIs, and frontend UX.
7. **Phase 7 – Testing & Rollout**: Execute staged rollout and monitor.

This phased approach ensures that the game can benefit from improved question management and difficulty handling early, while setting a robust foundation for rich, competitive tournament experiences built on the same question bank.
