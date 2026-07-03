# Content Pipeline + Difficulty-Aware Gameplay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the question CSV the single source of truth (with difficulty preserved), wire difficulty into XP/badges/ordering, restore Eliminate + Hint power-ups with real UI, and add post-module review of missed questions.

**Architecture:** A Node generation script (`scripts/`) converts `questions/*.csv` → `src/data/IFRS17Modules.js` with a new `difficulty` field. Pure game logic (banded shuffle, XP weights, missed-question derivation, option elimination) lives in new `src/modules/questionUtils.js`; `src/modules/powerUps.js` is rewritten around `GAME_CONFIG.POWER_UPS`. UI changes touch `QuestionPanel`, a new `PowerUpBar`, a new `ReviewPanel`, `ModuleCompleteModal`, `ChatPanel` (auto-send hint), and the orchestrator `src/IFRS17TrainingGame.js`.

**Tech Stack:** CRA (React 19) + Jest/RTL for `src/**` tests; plain Node (CommonJS) + `node:test` for the generator; papaparse (devDependency) for CSV parsing.

**Spec:** `docs/superpowers/specs/2026-07-02-content-pipeline-difficulty-design.md`

## Global Constraints

- Work on branch `feature/difficulty-gameplay` (already created; spec committed there).
- Score formula UNCHANGED: `10 * (combo + 1)` points per correct answer.
- XP weights: beginner 25, standard 35, expert 50 (`GAME_CONFIG.XP_BY_DIFFICULTY`).
- Power-up allowance: `{ eliminate: 2, hint: 3 }` per module, reset to full at module start, no carry-over (`GAME_CONFIG.POWER_UPS`).
- Missing/unknown `difficulty` on a question is always treated as `'standard'`.
- `skip` power-up is removed everywhere; loading old saves containing `skip` must not crash (unknown keys ignored).
- Power-up use never disqualifies a perfect module; perfect = zero wrong answers.
- Review mode: no scoring, no XP, no combo, no timer, no power-ups; session-level state only.
- Generated `IFRS17Modules.js` keeps the existing code style (unquoted keys, double-quoted strings) so diffs stay reviewable.
- CSV header quirks that MUST be handled: column literally named `Module Nsme` (typo), complexity header is `Complexity (Beginner, Standard, Expert)`, `Correct Answer` holds the full TEXT of the correct option (not a number), and every row has ~12 trailing empty columns.
- The working tree has UNCOMMITTED user changes: `src/data/IFRS17Modules.js` (the 307-question expansion) and untracked `questions/`. Never `git checkout`/discard these. `.gitignore` is also modified — leave it out of our commits.
- Frontend tests: `npm test -- --watchAll=false <file>`. Generator tests: `npm run test:generator`. Dev server assumed NOT needed for any task.
- Repo path contains spaces — always quote paths in shell commands.

---

### Task 1: Difficulty utilities (`questionUtils.js`) + `GAME_CONFIG.XP_BY_DIFFICULTY`

**Files:**
- Modify: `src/config/gameConfig.js`
- Create: `src/modules/questionUtils.js`
- Test: `src/modules/__tests__/questionUtils.test.js`

**Interfaces:**
- Consumes: `GAME_CONFIG` from `src/config/gameConfig.js`.
- Produces (used by Tasks 5–7):
  - `normalizeDifficulty(difficulty: string|undefined) => 'beginner'|'standard'|'expert'`
  - `getXpForDifficulty(difficulty) => number`
  - `prepareModuleQuestions(questions: Array, rng?: () => number) => Array` — tags `originalIndex`, orders beginner→standard→expert, shuffles within each band
  - `getMissedQuestions(shuffledModuleQuestions: Array, answeredQuestions: Object, moduleIndex: number) => Array`
  - `pickEliminatedOptions(question: {options: string[], correct: number}, rng?: () => number) => number[]` (two wrong option indices)

- [ ] **Step 1: Write the failing test**

Create `src/modules/__tests__/questionUtils.test.js`:

```js
import {
  normalizeDifficulty,
  getXpForDifficulty,
  prepareModuleQuestions,
  getMissedQuestions,
  pickEliminatedOptions,
} from '../questionUtils';

const q = (difficulty, question = 'q') => ({
  question,
  options: ['a', 'b', 'c', 'd'],
  correct: 1,
  explanation: 'e',
  difficulty,
});

describe('normalizeDifficulty', () => {
  test('passes through known difficulties', () => {
    expect(normalizeDifficulty('beginner')).toBe('beginner');
    expect(normalizeDifficulty('standard')).toBe('standard');
    expect(normalizeDifficulty('expert')).toBe('expert');
  });

  test('defaults missing or unknown values to standard', () => {
    expect(normalizeDifficulty(undefined)).toBe('standard');
    expect(normalizeDifficulty(null)).toBe('standard');
    expect(normalizeDifficulty('EXTREME')).toBe('standard');
  });
});

describe('getXpForDifficulty', () => {
  test('returns weighted XP per difficulty', () => {
    expect(getXpForDifficulty('beginner')).toBe(25);
    expect(getXpForDifficulty('standard')).toBe(35);
    expect(getXpForDifficulty('expert')).toBe(50);
  });

  test('missing difficulty earns standard XP', () => {
    expect(getXpForDifficulty(undefined)).toBe(35);
  });
});

describe('prepareModuleQuestions', () => {
  test('orders all beginners before standards before experts', () => {
    const questions = [
      q('expert', 'e1'), q('beginner', 'b1'), q('standard', 's1'),
      q('beginner', 'b2'), q('expert', 'e2'), q('standard', 's2'),
    ];
    const prepared = prepareModuleQuestions(questions);
    const bands = prepared.map((x) => normalizeDifficulty(x.difficulty));
    expect(bands).toEqual(['beginner', 'beginner', 'standard', 'standard', 'expert', 'expert']);
  });

  test('tags each question with its originalIndex from the input array', () => {
    const questions = [q('expert', 'e1'), q('beginner', 'b1')];
    const prepared = prepareModuleQuestions(questions);
    const b1 = prepared.find((x) => x.question === 'b1');
    const e1 = prepared.find((x) => x.question === 'e1');
    expect(b1.originalIndex).toBe(1);
    expect(e1.originalIndex).toBe(0);
  });

  test('treats questions without difficulty as standard', () => {
    const questions = [q(undefined, 'no-diff'), q('beginner', 'b1'), q('expert', 'e1')];
    const prepared = prepareModuleQuestions(questions);
    expect(prepared.map((x) => x.question)).toEqual(['b1', 'no-diff', 'e1']);
  });

  test('returns empty array for empty/missing input', () => {
    expect(prepareModuleQuestions([])).toEqual([]);
    expect(prepareModuleQuestions()).toEqual([]);
  });
});

describe('getMissedQuestions', () => {
  test('returns only answered-and-wrong questions for the module', () => {
    const shuffled = [q('beginner', 'q0'), q('standard', 'q1'), q('expert', 'q2')];
    const answered = {
      '3-0': { answered: true, wasCorrect: true },
      '3-1': { answered: true, wasCorrect: false },
      // q2 unanswered
    };
    const missed = getMissedQuestions(shuffled, answered, 3);
    expect(missed.map((x) => x.question)).toEqual(['q1']);
  });

  test('returns empty array when nothing was missed', () => {
    const shuffled = [q('beginner', 'q0')];
    expect(getMissedQuestions(shuffled, { '0-0': { answered: true, wasCorrect: true } }, 0)).toEqual([]);
    expect(getMissedQuestions([], {}, 0)).toEqual([]);
  });
});

describe('pickEliminatedOptions', () => {
  test('returns exactly two indices, never the correct one', () => {
    const question = { options: ['a', 'b', 'c', 'd'], correct: 2 };
    for (let i = 0; i < 25; i += 1) {
      const picked = pickEliminatedOptions(question);
      expect(picked).toHaveLength(2);
      expect(picked).not.toContain(2);
      expect(new Set(picked).size).toBe(2);
    }
  });

  test('is deterministic with an injected rng', () => {
    const question = { options: ['a', 'b', 'c', 'd'], correct: 0 };
    const rngZero = () => 0;
    expect(pickEliminatedOptions(question, rngZero)).toEqual(pickEliminatedOptions(question, rngZero));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false questionUtils.test.js`
Expected: FAIL — `Cannot find module '../questionUtils'`

- [ ] **Step 3: Add XP config to `src/config/gameConfig.js`**

Insert after the `ENABLE_DEFERRED_AUTH: true,` line (line 8), keeping the existing comment style:

```js
  // XP awarded per correct answer, by question difficulty.
  // Score (10 * (combo + 1)) is intentionally NOT difficulty-weighted so
  // existing leaderboard entries stay comparable.
  XP_BY_DIFFICULTY: {
    beginner: 25,
    standard: 35,
    expert: 50
  },
```

- [ ] **Step 4: Create `src/modules/questionUtils.js`**

```js
// src/modules/questionUtils.js
// Pure helpers for difficulty-aware question flow. No React, no side effects.
import { GAME_CONFIG } from '../config/gameConfig';

const DIFFICULTY_BANDS = ['beginner', 'standard', 'expert'];

const shuffle = (array, rng = Math.random) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Old saves and hand-edited data may lack a difficulty field.
export const normalizeDifficulty = (difficulty) =>
  DIFFICULTY_BANDS.includes(difficulty) ? difficulty : 'standard';

export const getXpForDifficulty = (difficulty) =>
  GAME_CONFIG.XP_BY_DIFFICULTY[normalizeDifficulty(difficulty)];

// Tags originalIndex (position in the module's question array), then orders
// beginner -> standard -> expert with a shuffle inside each band.
export const prepareModuleQuestions = (questions = [], rng = Math.random) => {
  const tagged = questions.map((question, index) => ({
    ...question,
    originalIndex: index,
  }));
  return DIFFICULTY_BANDS.flatMap((band) =>
    shuffle(tagged.filter((question) => normalizeDifficulty(question.difficulty) === band), rng),
  );
};

// answeredQuestions keys are `${moduleIndex}-${positionInShuffledList}`.
export const getMissedQuestions = (shuffledModuleQuestions = [], answeredQuestions = {}, moduleIndex) =>
  shuffledModuleQuestions.filter((question, index) => {
    const entry = answeredQuestions[`${moduleIndex}-${index}`];
    return entry?.answered && !entry.wasCorrect;
  });

export const pickEliminatedOptions = (question, rng = Math.random) => {
  const wrongIndices = question.options
    .map((_, index) => index)
    .filter((index) => index !== question.correct);
  return shuffle(wrongIndices, rng).slice(0, 2);
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- --watchAll=false questionUtils.test.js`
Expected: PASS (all suites)

- [ ] **Step 6: Commit**

```bash
git add src/config/gameConfig.js src/modules/questionUtils.js src/modules/__tests__/questionUtils.test.js
git commit -m "feat: add difficulty utilities and XP-by-difficulty config"
```

---

### Task 2: Rewrite `powerUps.js`, consolidate defaults, sanitize on load

**Files:**
- Modify: `src/config/gameConfig.js`
- Modify: `src/modules/powerUps.js` (full rewrite)
- Modify: `src/hooks/useQuestionFlow.js:423` (refresh call site)
- Modify: `src/hooks/useGamePersistence.js:190,321,382` (sanitize on restore)
- Modify: `src/hooks/useGameUIActions.js:179`
- Modify: `src/modules/authService.js:118`
- Modify: `src/modules/storageService.js:82,136`
- Modify: `src/modules/supabaseUserService.js:112,396`
- Modify: `src/modules/supabaseService.js:276,364`
- Test: `src/modules/__tests__/powerUps.test.js`

(Line numbers are as of plan writing — locate by the quoted code if they have drifted. Do NOT touch `src/originalcode.js`, `src/backup/**`, or root `IFRS17TrainingGame.js` — dead legacy files.)

**Interfaces:**
- Consumes: `GAME_CONFIG.POWER_UPS` (added here).
- Produces (used by Task 6):
  - `INITIAL_POWER_UPS: { eliminate: number, hint: number }`
  - `canUsePowerUp(powerUps, type) => boolean` (unchanged signature)
  - `consumePowerUp(powerUps, type) => powerUps` (unchanged signature)
  - `refreshPowerUps() => { eliminate, hint }` — **now zero-arg**, returns a fresh full allowance
  - `sanitizePowerUps(saved: any) => { eliminate, hint }` — drops unknown keys (e.g. `skip`), clamps to allowance, defaults missing/invalid values
  - `POWER_UP_EFFECTS` / `getPowerUpInfo(type)` for `eliminate` and `hint`

- [ ] **Step 1: Write the failing test**

Create `src/modules/__tests__/powerUps.test.js`:

```js
import {
  INITIAL_POWER_UPS,
  canUsePowerUp,
  consumePowerUp,
  refreshPowerUps,
  sanitizePowerUps,
  getPowerUpInfo,
} from '../powerUps';

describe('power-up allowance', () => {
  test('initial and refreshed allowance is eliminate:2, hint:3 with no skip', () => {
    expect(INITIAL_POWER_UPS).toEqual({ eliminate: 2, hint: 3 });
    expect(refreshPowerUps()).toEqual({ eliminate: 2, hint: 3 });
  });

  test('refreshPowerUps returns a new object each call', () => {
    expect(refreshPowerUps()).not.toBe(refreshPowerUps());
  });
});

describe('consumePowerUp', () => {
  test('decrements and stops at zero', () => {
    let p = { eliminate: 1, hint: 0 };
    p = consumePowerUp(p, 'eliminate');
    expect(p.eliminate).toBe(0);
    expect(consumePowerUp(p, 'eliminate')).toEqual(p); // no-op at zero
    expect(consumePowerUp(p, 'hint')).toEqual(p);      // no-op at zero
    expect(canUsePowerUp(p, 'eliminate')).toBe(false);
  });
});

describe('sanitizePowerUps', () => {
  test('ignores unknown keys from old saves (skip)', () => {
    expect(sanitizePowerUps({ skip: 3, hint: 1, eliminate: 0 })).toEqual({ eliminate: 0, hint: 1 });
  });

  test('fills missing keys with full allowance and clamps overlarge values', () => {
    expect(sanitizePowerUps({ hint: 99 })).toEqual({ eliminate: 2, hint: 3 });
    expect(sanitizePowerUps(undefined)).toEqual({ eliminate: 2, hint: 3 });
    expect(sanitizePowerUps(null)).toEqual({ eliminate: 2, hint: 3 });
    expect(sanitizePowerUps({ eliminate: -1, hint: 'x' })).toEqual({ eliminate: 2, hint: 3 });
  });
});

describe('getPowerUpInfo', () => {
  test('describes eliminate and hint; skip is gone', () => {
    expect(getPowerUpInfo('eliminate').name).toBe('Eliminate');
    expect(getPowerUpInfo('hint').name).toBe('Hint');
    expect(getPowerUpInfo('skip')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false powerUps.test.js`
Expected: FAIL — `INITIAL_POWER_UPS` is `{ skip: 2 }`, `sanitizePowerUps` not exported, etc.

- [ ] **Step 3: Add `POWER_UPS` to `GAME_CONFIG`**

In `src/config/gameConfig.js`, insert directly after the `XP_BY_DIFFICULTY` block added in Task 1:

```js
  // Per-module power-up allowance. Reset to full at every module start.
  POWER_UPS: {
    eliminate: 2,
    hint: 3
  },
```

- [ ] **Step 4: Rewrite `src/modules/powerUps.js`** (replace the whole file)

```js
// src/modules/powerUps.js
// Power-up definitions and state helpers. Allowance lives in GAME_CONFIG.POWER_UPS.
import { GAME_CONFIG } from '../config/gameConfig';

export const INITIAL_POWER_UPS = { ...GAME_CONFIG.POWER_UPS };

// Check if a power-up can be used
export const canUsePowerUp = (powerUps, type) => {
  return powerUps?.[type] > 0;
};

// Use a power-up (decrease count)
export const consumePowerUp = (powerUps, type) => {
  if (!canUsePowerUp(powerUps, type)) return powerUps;

  return {
    ...powerUps,
    [type]: powerUps[type] - 1
  };
};

// Full allowance at every module start — no carry-over between modules.
export const refreshPowerUps = () => ({ ...GAME_CONFIG.POWER_UPS });

// Saved progress may predate the current power-up set (e.g. contain "skip").
// Keep only known keys, clamp to the allowance, default anything invalid.
export const sanitizePowerUps = (saved) => {
  const clean = { ...GAME_CONFIG.POWER_UPS };
  if (saved && typeof saved === 'object') {
    Object.keys(clean).forEach((type) => {
      const value = saved[type];
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
        clean[type] = Math.min(value, GAME_CONFIG.POWER_UPS[type]);
      }
    });
  }
  return clean;
};

// Power-up effects
export const POWER_UP_EFFECTS = {
  eliminate: {
    name: 'Eliminate',
    icon: '✂️',
    description: 'Remove two wrong options from the current question'
  },
  hint: {
    name: 'Hint',
    icon: '💡',
    description: 'Ask the AI assistant for a hint about the current question'
  }
};

// Get power-up display info
export const getPowerUpInfo = (type) => {
  return POWER_UP_EFFECTS[type] || null;
};
```

- [ ] **Step 5: Update the refresh call site**

In `src/hooks/useQuestionFlow.js` (inside `startNewModule`, ~line 423):

```js
// old
setPowerUps((prev) => refreshPowerUps(prev));
// new
setPowerUps(refreshPowerUps());
```

- [ ] **Step 6: Sanitize on every restore path in `src/hooks/useGamePersistence.js`**

Add `sanitizePowerUps` to the existing import from `../modules/powerUps` (the file already imports `INITIAL_POWER_UPS`; if the import line reads `import { INITIAL_POWER_UPS } from '../modules/powerUps';` make it `import { INITIAL_POWER_UPS, sanitizePowerUps } from '../modules/powerUps';`). Then:

```js
// ~line 190 — old
setPowerUps(savedState.powerUps || INITIAL_POWER_UPS);
// new
setPowerUps(sanitizePowerUps(savedState.powerUps));

// ~line 321 — old
setPowerUps(data.power_ups || INITIAL_POWER_UPS);
// new
setPowerUps(sanitizePowerUps(data.power_ups));

// ~line 382 — old
setPowerUps(mergedProgress.powerUps || INITIAL_POWER_UPS);
// new
setPowerUps(sanitizePowerUps(mergedProgress.powerUps));
```

Leave the plain reset sites (`setPowerUps(INITIAL_POWER_UPS)` at ~237, ~301, ~462) unchanged — `INITIAL_POWER_UPS` is now the correct `{ eliminate, hint }` object.

- [ ] **Step 7: Replace the divergent default literals**

In each file below, replace the literal `{ skip: 3, hint: 3, eliminate: 3 }` and add the import shown (adjust relative path per file; skip the import if the file already imports from `powerUps`):

`src/hooks/useGameUIActions.js` (~179), import `import { sanitizePowerUps } from '../modules/powerUps';`:

```js
// old
powerUps: powerUps || { skip: 3, hint: 3, eliminate: 3 },
// new
powerUps: sanitizePowerUps(powerUps),
```

`src/modules/authService.js` (~118), import `import { INITIAL_POWER_UPS } from './powerUps';`:

```js
// old
power_ups: { skip: 3, hint: 3, eliminate: 3 },
// new
power_ups: { ...INITIAL_POWER_UPS },
```

`src/modules/storageService.js` (~82 and ~136), import `import { INITIAL_POWER_UPS, sanitizePowerUps } from './powerUps';`:

```js
// ~82 — old
powerUps: gameState.powerUps || { skip: 3, hint: 3, eliminate: 3 },
// new
powerUps: sanitizePowerUps(gameState.powerUps),

// ~136 — old
powerUps: dbProgress.power_ups || { skip: 3, hint: 3, eliminate: 3 },
// new
powerUps: sanitizePowerUps(dbProgress.power_ups),
```

`src/modules/supabaseUserService.js` (~112 and ~396), import `import { INITIAL_POWER_UPS, sanitizePowerUps } from './powerUps';`:

```js
// ~112 — old
power_ups: { skip: 3, hint: 3, eliminate: 3 },
// new
power_ups: { ...INITIAL_POWER_UPS },

// ~396 — old
power_ups: progress.powerUps || { skip: 3, hint: 3, eliminate: 3 },
// new
power_ups: sanitizePowerUps(progress.powerUps),
```

`src/modules/supabaseService.js` (~276 and ~364), import `import { INITIAL_POWER_UPS, sanitizePowerUps } from './powerUps';`:

```js
// ~276 — old
power_ups: progressData.powerUps ?? { skip: 3, hint: 3, eliminate: 3 },
// new
power_ups: sanitizePowerUps(progressData.powerUps),

// ~364 — old
power_ups: { skip: 3, hint: 3, eliminate: 3 },
// new
power_ups: { ...INITIAL_POWER_UPS },
```

If any file ends up importing `INITIAL_POWER_UPS` or `sanitizePowerUps` without using it, drop the unused name — CI builds treat ESLint warnings as errors.

- [ ] **Step 8: Run tests + full suite to verify**

Run: `npm test -- --watchAll=false powerUps.test.js`
Expected: PASS

Run: `npm test -- --watchAll=false`
Expected: PASS (App smoke test, persistence tests, questionUtils from Task 1)

- [ ] **Step 9: Commit**

```bash
git add src/config/gameConfig.js src/modules/powerUps.js src/modules/__tests__/powerUps.test.js src/hooks/useQuestionFlow.js src/hooks/useGamePersistence.js src/hooks/useGameUIActions.js src/modules/authService.js src/modules/storageService.js src/modules/supabaseUserService.js src/modules/supabaseService.js
git commit -m "refactor: consolidate power-ups to eliminate+hint with sanitized loads"
```

---

### Task 3: CSV → JS generator script

**Files:**
- Create: `scripts/lib/moduleMetadata.js`
- Create: `scripts/lib/buildModules.js`
- Create: `scripts/generate-modules.js`
- Modify: `package.json` (devDependency + 2 scripts)
- Test: `scripts/tests/buildModules.test.js`

**Interfaces:**
- Consumes: the CSV format described in Global Constraints.
- Produces:
  - `buildModules(csvText) => { modules: Array|null, errors: string[] }` (CommonJS export)
  - `serializeModules(modules) => string` — file body for `src/data/IFRS17Modules.js`
  - npm scripts: `npm run generate:questions`, `npm run test:generator`
- Question shape emitted: `{ question, options[4], correct: 0-3, explanation, difficulty: 'beginner'|'standard'|'expert' }`

- [ ] **Step 1: Install papaparse**

Run: `npm install --save-dev papaparse`
Expected: added to `devDependencies` in `package.json`.

- [ ] **Step 2: Create `scripts/lib/moduleMetadata.js`**

Metadata is not in the CSV; this map (extracted from the current `IFRS17Modules.js`) owns title/icon/color per CSV `Module No`:

```js
// scripts/lib/moduleMetadata.js
// Display metadata per CSV "Module No". The CSV owns questions; this map owns presentation.
module.exports = {
  1: { title: 'IFRS 17 Fundamentals', icon: '📚', color: 'from-blue-500 to-blue-600' },
  2: { title: 'Combination & Separation of Insurance Contracts', icon: '🎯', color: 'from-purple-500 to-purple-600' },
  3: { title: 'Level of Aggregation', icon: '📊', color: 'from-green-500 to-green-600' },
  4: { title: 'Recognition of Insurance Contracts', icon: '📏', color: 'from-red-500 to-red-600' },
  5: { title: 'Measurement on Initial Recognition', icon: '🔒', color: 'from-yellow-500 to-yellow-600' },
  6: { title: 'Subsequent Measurement', icon: '🚀', color: 'from-indigo-500 to-indigo-600' },
  7: { title: 'Discounting CSM and Risk Adjustment', icon: '🔄', color: 'from-pink-500 to-pink-600' },
  8: { title: 'Onerous Contracts', icon: '⚠️', color: 'from-orange-500 to-orange-600' },
  9: { title: 'Premium Allocation Approach', icon: '📋', color: 'from-teal-500 to-teal-600' },
  10: { title: 'Reinsurance Contracts Held', icon: '🔀', color: 'from-cyan-500 to-cyan-600' },
  11: { title: 'Investment Contracts with Discretionary Participation Features', icon: '💰', color: 'from-emerald-500 to-emerald-600' },
  12: { title: 'Modification and Derecognition of Insurance Contracts', icon: '✂️', color: 'from-rose-500 to-rose-600' },
  13: { title: 'Presentation in the Statement of Financial Position', icon: '🧾', color: 'from-violet-500 to-violet-600' },
  14: { title: 'Insurance Service Result', icon: '📈', color: 'from-amber-500 to-amber-600' },
  15: { title: 'Insurance Finance Income or Expenses', icon: '💹', color: 'from-sky-500 to-sky-600' },
};
```

- [ ] **Step 3: Write the failing generator test**

Create `scripts/tests/buildModules.test.js` (Node built-in test runner, CommonJS):

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildModules, serializeModules } = require('../lib/buildModules');

// Mirrors the real file's quirks: "Module Nsme" typo, verbose Complexity
// header, text-based Correct Answer, trailing empty columns.
const HEADER = 'Module No,Module Nsme,"Complexity (Beginner, Standard, Expert)",Question,Option 1,Option 2,Option 3,Option 4,Correct Answer,Explanation,,,,,,,,,,,,';

const row = (over = {}) => {
  const r = {
    no: '1', complexity: 'Beginner', q: 'What is X?',
    o1: 'A', o2: 'B', o3: 'C', o4: 'D', correct: 'B', expl: 'Because B.',
    ...over,
  };
  return `${r.no},IFRS 17 Fundamentals,${r.complexity},${r.q},${r.o1},${r.o2},${r.o3},${r.o4},${r.correct},${r.expl},,,,,,,,,,,,`;
};

const csv = (...rows) => [HEADER, ...rows].join('\n');

test('parses a valid row into a module question with difficulty', () => {
  const { modules, errors } = buildModules(csv(row()));
  assert.equal(errors.length, 0);
  assert.equal(modules.length, 1);
  assert.equal(modules[0].title, 'IFRS 17 Fundamentals');
  assert.deepEqual(modules[0].questions[0], {
    question: 'What is X?',
    options: ['A', 'B', 'C', 'D'],
    correct: 1,
    explanation: 'Because B.',
    difficulty: 'beginner',
  });
});

test('resolves numeric 1-4 Correct Answer to a zero-based index', () => {
  const { modules, errors } = buildModules(csv(row({ correct: '3' })));
  assert.equal(errors.length, 0);
  assert.equal(modules[0].questions[0].correct, 2);
});

test('rejects a Correct Answer that matches no option, with row number', () => {
  const { modules, errors } = buildModules(csv(row(), row({ correct: 'Nonsense' })));
  assert.equal(modules, null);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Row 3/);
  assert.match(errors[0], /does not match any option/);
});

test('rejects unknown complexity, empty explanation, missing option, bad module no', () => {
  const { modules, errors } = buildModules(csv(
    row({ complexity: 'Impossible' }),
    row({ expl: '' }),
    row({ o3: '' }),
    row({ no: '99' }),
  ));
  assert.equal(modules, null);
  assert.equal(errors.length, 4);
  assert.match(errors[0], /Row 2.*Complexity/);
  assert.match(errors[1], /Row 3.*Explanation/);
  assert.match(errors[2], /Row 4.*option/);
  assert.match(errors[3], /Row 5.*Module No/);
});

test('groups rows into modules ordered by module number', () => {
  const { modules, errors } = buildModules(csv(row({ no: '2' }), row({ no: '1' }), row({ no: '2', q: 'Second?' })));
  assert.equal(errors.length, 0);
  assert.equal(modules.length, 2);
  assert.equal(modules[0].title, 'IFRS 17 Fundamentals');
  assert.equal(modules[1].questions.length, 2);
});

test('serializeModules emits the existing unquoted-key style with a generated header', () => {
  const { modules } = buildModules(csv(row()));
  const out = serializeModules(modules);
  assert.match(out, /^\/\/ src\/data\/IFRS17Modules\.js/);
  assert.match(out, /GENERATED FILE/);
  assert.match(out, /export const modules = \[/);
  assert.match(out, /    title: "IFRS 17 Fundamentals",/);
  assert.match(out, /        difficulty: "beginner"/);
  assert.doesNotMatch(out, /"title":/); // no JSON-quoted keys
});
```

- [ ] **Step 4: Add npm scripts, run test to verify it fails**

In `package.json` `"scripts"`, add:

```json
"generate:questions": "node scripts/generate-modules.js",
"test:generator": "node --test scripts/tests/buildModules.test.js"
```

Run: `npm run test:generator`
Expected: FAIL — `Cannot find module '../lib/buildModules'`

- [ ] **Step 5: Create `scripts/lib/buildModules.js`**

```js
// scripts/lib/buildModules.js
// Pure CSV -> modules transformation. No filesystem access — testable in isolation.
const Papa = require('papaparse');
const MODULE_METADATA = require('./moduleMetadata');

const DIFFICULTIES = ['beginner', 'standard', 'expert'];

// The real CSV's headers are messy ("Module Nsme" typo, a verbose Complexity
// header, trailing empty columns) — resolve columns by prefix, not exact name.
const resolveColumns = (fields) => {
  const norm = (s) => (s || '').trim().toLowerCase();
  const find = (predicate) => fields.find((f) => predicate(norm(f)));
  return {
    moduleNo: find((f) => f.startsWith('module no')),
    complexity: find((f) => f.startsWith('complexity')),
    question: find((f) => f === 'question'),
    options: [1, 2, 3, 4].map((n) => find((f) => f === `option ${n}`)),
    correct: find((f) => f.startsWith('correct answer')),
    explanation: find((f) => f === 'explanation'),
  };
};

const buildModules = (csvText) => {
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: 'greedy' });
  const cols = resolveColumns(parsed.meta.fields || []);

  const missing = Object.entries(cols)
    .filter(([, v]) => (Array.isArray(v) ? v.some((c) => !c) : !v))
    .map(([name]) => name);
  if (missing.length) {
    return { modules: null, errors: [`CSV is missing expected columns: ${missing.join(', ')}`] };
  }

  const errors = [];
  const byModule = new Map();

  parsed.data.forEach((row, i) => {
    const csvRow = i + 2; // 1-based, +1 for the header row
    const rowErrors = [];

    const moduleNo = parseInt((row[cols.moduleNo] || '').trim(), 10);
    if (!MODULE_METADATA[moduleNo]) rowErrors.push(`unknown Module No "${row[cols.moduleNo]}"`);

    const question = (row[cols.question] || '').trim();
    if (!question) rowErrors.push('empty Question');

    const options = cols.options.map((c) => (row[c] || '').trim());
    if (options.some((o) => !o)) rowErrors.push('fewer than 4 non-empty options');

    const explanation = (row[cols.explanation] || '').trim();
    if (!explanation) rowErrors.push('empty Explanation');

    const difficulty = (row[cols.complexity] || '').trim().toLowerCase();
    if (!DIFFICULTIES.includes(difficulty)) rowErrors.push(`unknown Complexity "${row[cols.complexity]}"`);

    const correctRaw = (row[cols.correct] || '').trim();
    let correct;
    if (/^[1-4]$/.test(correctRaw)) {
      correct = parseInt(correctRaw, 10) - 1;
    } else {
      correct = options.indexOf(correctRaw);
    }
    if (correct < 0) rowErrors.push(`Correct Answer "${correctRaw}" does not match any option`);

    if (rowErrors.length) {
      errors.push(`Row ${csvRow}: ${rowErrors.join('; ')}`);
      return;
    }

    if (!byModule.has(moduleNo)) byModule.set(moduleNo, []);
    byModule.get(moduleNo).push({ question, options, correct, explanation, difficulty });
  });

  if (errors.length) return { modules: null, errors };

  const modules = [...byModule.keys()]
    .sort((a, b) => a - b)
    .map((no) => ({ ...MODULE_METADATA[no], questions: byModule.get(no) }));
  return { modules, errors: [] };
};

// Emits the same style as the hand-written file (unquoted keys, double-quoted
// strings) so content diffs stay readable line-by-line.
const serializeModules = (modules) => {
  const str = (value) => JSON.stringify(value);
  const lines = [
    '// src/data/IFRS17Modules.js',
    '// GENERATED FILE — do not hand-edit.',
    '// Source of truth: questions/ifrs17_questions_choices_explanations excel database.csv',
    '// Regenerate with: npm run generate:questions',
    'export const modules = [',
  ];
  modules.forEach((m) => {
    lines.push('  {');
    lines.push(`    title: ${str(m.title)},`);
    lines.push(`    icon: ${str(m.icon)},`);
    lines.push(`    color: ${str(m.color)},`);
    lines.push('    questions: [');
    m.questions.forEach((q) => {
      lines.push('      {');
      lines.push(`        question: ${str(q.question)},`);
      lines.push('        options: [');
      q.options.forEach((o, i) => lines.push(`          ${str(o)}${i < q.options.length - 1 ? ',' : ''}`));
      lines.push('        ],');
      lines.push(`        correct: ${q.correct},`);
      lines.push(`        explanation: ${str(q.explanation)},`);
      lines.push(`        difficulty: ${str(q.difficulty)}`);
      lines.push('      },');
    });
    lines.push('    ]');
    lines.push('  },');
  });
  lines.push('];');
  return `${lines.join('\n')}\n`;
};

module.exports = { buildModules, serializeModules };
```

- [ ] **Step 6: Run generator tests to verify they pass**

Run: `npm run test:generator`
Expected: PASS (all 6 tests)

- [ ] **Step 7: Create the CLI wrapper `scripts/generate-modules.js`**

```js
// scripts/generate-modules.js
// Regenerates src/data/IFRS17Modules.js from the question CSV.
// Usage: npm run generate:questions
const fs = require('fs');
const path = require('path');
const { buildModules, serializeModules } = require('./lib/buildModules');

const CSV_PATH = path.join(__dirname, '..', 'questions', 'ifrs17_questions_choices_explanations excel database.csv');
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'IFRS17Modules.js');

const csvText = fs.readFileSync(CSV_PATH, 'utf8');
const { modules, errors } = buildModules(csvText);

if (errors.length) {
  console.error(`Generation FAILED — ${errors.length} problem(s), nothing written:`);
  errors.forEach((e) => console.error(`  ${e}`));
  process.exit(1);
}

fs.writeFileSync(OUT_PATH, serializeModules(modules), 'utf8');
const total = modules.reduce((sum, m) => sum + m.questions.length, 0);
console.log(`Wrote ${modules.length} modules, ${total} questions to ${path.relative(process.cwd(), OUT_PATH)}`);
modules.forEach((m, i) => console.log(`  ${i + 1}. ${m.title}: ${m.questions.length} questions`));
```

- [ ] **Step 8: Smoke-run the CLI against the real CSV**

**FIRST, before generating anything**, preserve Robin's uncommitted manual import — Task 4 verifies the generated output against it. NEVER run `git checkout`/`git restore` on `src/data/IFRS17Modules.js`: the HEAD version has only 98 questions and restoring it would destroy the uncommitted 307-question expansion.

```bash
cp "src/data/IFRS17Modules.js" "$SCRATCHPAD/IFRS17Modules.manual.js"   # $SCRATCHPAD = session scratchpad dir
```

Then run: `npm run generate:questions`
Expected: either `Wrote 15 modules, ~307 questions ...` with a per-module list, **or** a failure listing specific bad rows. If rows fail: fix a CSV row **only if the fix is unambiguous** (e.g. trailing whitespace); otherwise stop and surface the failing rows to Robin. On success, leave the freshly generated `src/data/IFRS17Modules.js` in the working tree — Task 4 verifies and commits it.

- [ ] **Step 9: Commit the tooling (not the regenerated data file)**

```bash
git add scripts/ package.json package-lock.json
git commit -m "feat: add CSV-to-modules generator with validation"
```

---

### Task 4: Regenerate content, verify against the manual import, commit CSV + data

**Files:**
- Create: `scripts/compare-modules.mjs` (kept in repo — reusable safety net)
- Commit: `questions/ifrs17_questions_choices_explanations excel database.csv`, regenerated `src/data/IFRS17Modules.js`

**Interfaces:**
- Consumes: `$SCRATCHPAD/IFRS17Modules.manual.js` (copy made in Task 3 Step 8), generated `src/data/IFRS17Modules.js`.
- Produces: committed CSV + generated data file; both future tasks and the game consume `modules` (each question now has `difficulty`).

- [ ] **Step 1: Create `scripts/compare-modules.mjs`**

```js
// scripts/compare-modules.mjs
// Semantic diff of two IFRS17Modules files (ignores the difficulty field).
// Usage: node scripts/compare-modules.mjs <old-file.mjs> <new-file.mjs>
// Files must be ESM (the data file already is; copy .js -> .mjs before use).
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const [oldPath, newPath] = process.argv.slice(2);
if (!oldPath || !newPath) {
  console.error('Usage: node scripts/compare-modules.mjs <old.mjs> <new.mjs>');
  process.exit(2);
}
const oldModules = (await import(pathToFileURL(resolve(oldPath)))).modules;
const newModules = (await import(pathToFileURL(resolve(newPath)))).modules;

const diffs = [];
if (oldModules.length !== newModules.length) {
  diffs.push(`module count: ${oldModules.length} -> ${newModules.length}`);
}
oldModules.forEach((om, mi) => {
  const nm = newModules[mi];
  if (!nm) return;
  if (om.title !== nm.title) diffs.push(`module ${mi + 1} title: ${JSON.stringify(om.title)} -> ${JSON.stringify(nm.title)}`);
  if (om.questions.length !== nm.questions.length) diffs.push(`module ${mi + 1} question count: ${om.questions.length} -> ${nm.questions.length}`);
  om.questions.forEach((oq, qi) => {
    const nq = nm.questions[qi];
    if (!nq) return;
    const tag = `module ${mi + 1} question ${qi + 1}`;
    if (oq.question !== nq.question) diffs.push(`${tag}: text differs`);
    if (JSON.stringify(oq.options) !== JSON.stringify(nq.options)) diffs.push(`${tag}: options differ`);
    if (oq.correct !== nq.correct) diffs.push(`${tag}: correct ${oq.correct} -> ${nq.correct}`);
    if (oq.explanation !== nq.explanation) diffs.push(`${tag}: explanation differs`);
  });
});
console.log(diffs.length ? diffs.join('\n') : 'CONTENT IDENTICAL (ignoring difficulty)');
```

- [ ] **Step 2: Run the semantic comparison**

```bash
cp "$SCRATCHPAD/IFRS17Modules.manual.js" "$SCRATCHPAD/old.mjs"
cp "src/data/IFRS17Modules.js" "$SCRATCHPAD/new.mjs"
node scripts/compare-modules.mjs "$SCRATCHPAD/old.mjs" "$SCRATCHPAD/new.mjs"
```

Expected: `CONTENT IDENTICAL (ignoring difficulty)`. If differences print: per the spec, **the CSV wins** — review each one (question order inside a module may legitimately differ if the manual import reordered rows; content text should not), and list every discrepancy in the commit message body. If a diff looks like generator breakage rather than manual-import drift (e.g. mangled quotes, truncated text), fix the generator, regenerate, and re-compare before proceeding.

- [ ] **Step 3: Sanity-check the app consumes the generated file**

Run: `npm test -- --watchAll=false`
Expected: PASS.

Run: `node -e "const t=require('fs').readFileSync('src/data/IFRS17Modules.js','utf8'); console.log('modules:', (t.match(/title: \"/g)||[]).length, 'questions:', (t.match(/question: \"/g)||[]).length, 'difficulty:', (t.match(/difficulty: \"/g)||[]).length)"`
Expected: `modules: 15 questions: <N> difficulty: <N>` where both `<N>` values are equal (~307).

- [ ] **Step 4: Commit CSV + generated data + compare tool**

```bash
git add "questions/ifrs17_questions_choices_explanations excel database.csv" src/data/IFRS17Modules.js scripts/compare-modules.mjs
git commit -m "feat: commit question CSV as source of truth; regenerate modules with difficulty"
```

(If Step 2 surfaced discrepancies, append them to the commit body. Do NOT include `.gitignore` in this commit.)

---

### Task 5: Difficulty in the game loop — banded order, weighted XP, badge

**Files:**
- Modify: `src/hooks/useQuestionFlow.js`
- Modify: `src/components/game/QuestionPanel/QuestionPanel.js`
- Test: `src/components/game/QuestionPanel/__tests__/QuestionPanel.test.js`

**Interfaces:**
- Consumes: `prepareModuleQuestions`, `getXpForDifficulty`, `normalizeDifficulty` from `src/modules/questionUtils` (Task 1); `difficulty` field from Task 4 data.
- Produces: `QuestionPanel` renders a difficulty badge; XP flows use weights. No API/prop changes other than internal.

- [ ] **Step 1: Write the failing badge test**

Create `src/components/game/QuestionPanel/__tests__/QuestionPanel.test.js`:

```js
import React from 'react';
import { render, screen } from '@testing-library/react';
import QuestionPanel from '../QuestionPanel';

const baseProps = {
  moduleTitle: 'Test Module',
  currentModule: 0,
  currentQuestionIndex: 0,
  timerState: 'idle',
  currentTime: 0,
  formatTime: (s) => `${s}`,
  correctCount: 0,
  wrongCount: 0,
  answeredQuestions: {},
  showFeedback: false,
  selectedAnswer: null,
  isCorrect: false,
  combo: 0,
  streak: 0,
  onAnswer: () => {},
  onAskHelp: () => {},
};

const question = (difficulty) => ({
  question: 'What is X?',
  options: ['A', 'B', 'C', 'D'],
  correct: 0,
  explanation: 'Because.',
  difficulty,
});

test('shows the difficulty badge for an expert question', () => {
  render(<QuestionPanel {...baseProps} questions={[question('expert')]} />);
  expect(screen.getByText('Expert')).toBeInTheDocument();
});

test('falls back to Standard when difficulty is missing', () => {
  render(<QuestionPanel {...baseProps} questions={[question(undefined)]} />);
  expect(screen.getByText('Standard')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false QuestionPanel.test.js`
Expected: FAIL — `Unable to find an element with the text: Expert`

- [ ] **Step 3: Add the badge to `QuestionPanel.js`**

Add the import at the top:

```js
import { normalizeDifficulty } from '../../../modules/questionUtils';
```

Add above the component (after imports):

```js
const DIFFICULTY_BADGE = {
  beginner: { label: 'Beginner', className: 'bg-green-900/30 border-green-400/30 text-green-300' },
  standard: { label: 'Standard', className: 'bg-amber-900/30 border-amber-400/30 text-amber-300' },
  expert: { label: 'Expert', className: 'bg-red-900/30 border-red-400/30 text-red-300' },
};
```

Inside the component, after `const progress = ...`, add:

```js
  const difficultyBadge = DIFFICULTY_BADGE[normalizeDifficulty(currentQuestion?.difficulty)];
```

Then render it beside the module title — replace the `<h3>` block:

```jsx
          <h3 className="text-lg md:text-xl font-bold text-white">
            {moduleTitle} - Question {currentQuestionIndex + 1}/{totalQuestions}
          </h3>
```

with:

```jsx
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg md:text-xl font-bold text-white">
              {moduleTitle} - Question {currentQuestionIndex + 1}/{totalQuestions}
            </h3>
            <span className={`px-2 py-1 rounded-md border text-xs font-semibold uppercase tracking-wide ${difficultyBadge.className}`}>
              {difficultyBadge.label}
            </span>
          </div>
```

- [ ] **Step 4: Run badge test to verify it passes**

Run: `npm test -- --watchAll=false QuestionPanel.test.js`
Expected: PASS

- [ ] **Step 5: Switch `useQuestionFlow.js` to banded ordering + weighted XP**

Replace the import block's shuffle usage. At the top, add:

```js
import { prepareModuleQuestions, getXpForDifficulty } from '../modules/questionUtils';
```

Delete the local `shuffleArray` function (lines 7–14) entirely.

In `getShuffledQuestions` (~lines 89–95), replace:

```js
    const originalQuestions = moduleDef.questions || [];
    const prepared = shuffleArray(
      originalQuestions.map((q, index) => ({
        ...q,
        originalIndex: index,
      })),
    );
```

with:

```js
    const prepared = prepareModuleQuestions(moduleDef.questions || []);
```

In `startNewModule` (~lines 404–410), replace:

```js
    const originalQuestions = modules[moduleIndex].questions;
    const shuffled = shuffleArray(
      originalQuestions.map((q, index) => ({
        ...q,
        originalIndex: index,
      })),
    );
```

with:

```js
    const shuffled = prepareModuleQuestions(modules[moduleIndex].questions);
```

In `handleAnswer` (~line 296), replace:

```js
      newXp = xp + 25;
```

with:

```js
      newXp = xp + getXpForDifficulty(currentQuestionData.difficulty);
```

(Leave `const points = 10 * (combo + 1);` and the level-up threshold `newXp >= level * 100` untouched.)

- [ ] **Step 6: Run the full frontend suite**

Run: `npm test -- --watchAll=false`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useQuestionFlow.js src/components/game/QuestionPanel/QuestionPanel.js src/components/game/QuestionPanel/__tests__/QuestionPanel.test.js
git commit -m "feat: banded question ordering, difficulty-weighted XP, difficulty badge"
```

---

### Task 6: Power-up UI — Eliminate + Hint (with chatbot auto-send)

**Files:**
- Create: `src/components/game/QuestionPanel/PowerUpBar.js`
- Modify: `src/components/game/QuestionPanel/QuestionPanel.js`
- Modify: `src/components/ChatPanel.js` (auto-send a pending message)
- Modify: `src/IFRS17TrainingGame.js` (state + handlers + wiring)
- Test: `src/components/game/QuestionPanel/__tests__/PowerUpBar.test.js`

**Interfaces:**
- Consumes: `canUsePowerUp`, `consumePowerUp` from `src/modules/powerUps` (Task 2); `pickEliminatedOptions` from `src/modules/questionUtils` (Task 1).
- Produces:
  - `PowerUpBar` props: `{ powerUps, onUseEliminate, onUseHint, eliminateDisabled, hintDisabled }`
  - New `QuestionPanel` props: `{ powerUps, eliminatedOptions, hintUsed, onUseEliminate, onUseHint }` (`eliminatedOptions` = array of option indices for the CURRENT question; `hintUsed` = boolean for the current question)
  - New `ChatPanel` props: `{ pendingMessage: { text: string, id: number } | null, onPendingMessageConsumed: () => void }`

- [ ] **Step 1: Write the failing PowerUpBar test**

Create `src/components/game/QuestionPanel/__tests__/PowerUpBar.test.js`:

```js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PowerUpBar from '../PowerUpBar';

test('shows remaining counts and fires handlers', () => {
  const onUseEliminate = jest.fn();
  const onUseHint = jest.fn();
  render(
    <PowerUpBar
      powerUps={{ eliminate: 2, hint: 3 }}
      onUseEliminate={onUseEliminate}
      onUseHint={onUseHint}
      eliminateDisabled={false}
      hintDisabled={false}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: /eliminate/i }));
  fireEvent.click(screen.getByRole('button', { name: /hint/i }));
  expect(onUseEliminate).toHaveBeenCalledTimes(1);
  expect(onUseHint).toHaveBeenCalledTimes(1);
  expect(screen.getByText('2')).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();
});

test('disables buttons when told to', () => {
  render(
    <PowerUpBar
      powerUps={{ eliminate: 0, hint: 1 }}
      onUseEliminate={() => {}}
      onUseHint={() => {}}
      eliminateDisabled
      hintDisabled
    />,
  );
  expect(screen.getByRole('button', { name: /eliminate/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /hint/i })).toBeDisabled();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false PowerUpBar.test.js`
Expected: FAIL — `Cannot find module '../PowerUpBar'`

- [ ] **Step 3: Create `src/components/game/QuestionPanel/PowerUpBar.js`**

```jsx
import React from 'react';
import { Lightbulb, Scissors } from 'lucide-react';

const buttonClass = (disabled) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
    disabled
      ? 'bg-gray-800/40 border-gray-600/40 text-gray-500 cursor-not-allowed'
      : 'bg-purple-600/30 hover:bg-purple-600/50 border-purple-400/30 hover:border-purple-400/50 text-purple-200'
  }`;

const PowerUpBar = ({ powerUps, onUseEliminate, onUseHint, eliminateDisabled, hintDisabled }) => (
  <div className="flex items-center gap-2 mb-4 flex-wrap">
    <span className="text-xs text-gray-400 uppercase tracking-wide">Power-ups</span>
    <button
      type="button"
      onClick={onUseEliminate}
      disabled={eliminateDisabled}
      title="Remove two wrong options from this question"
      className={buttonClass(eliminateDisabled)}
    >
      <Scissors className="w-4 h-4" />
      <span>Eliminate</span>
      <span className="px-1.5 py-0.5 rounded bg-black/30 font-mono text-xs">{powerUps?.eliminate ?? 0}</span>
    </button>
    <button
      type="button"
      onClick={onUseHint}
      disabled={hintDisabled}
      title="Ask the AI assistant for a hint (won't reveal the answer)"
      className={buttonClass(hintDisabled)}
    >
      <Lightbulb className="w-4 h-4" />
      <span>Hint</span>
      <span className="px-1.5 py-0.5 rounded bg-black/30 font-mono text-xs">{powerUps?.hint ?? 0}</span>
    </button>
  </div>
);

export default PowerUpBar;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watchAll=false PowerUpBar.test.js`
Expected: PASS

- [ ] **Step 5: Wire PowerUpBar + eliminated options into `QuestionPanel.js`**

Add props to the signature (after `onAskHelp,`): `powerUps, eliminatedOptions, hintUsed, onUseEliminate, onUseHint,`

Add the import: `import PowerUpBar from './PowerUpBar';`

Inside the component, after the `difficultyBadge` line (Task 5), add:

```js
  const answered = answeredQuestions[questionKey]?.answered;
  const eliminated = eliminatedOptions || [];
  const eliminateDisabled = showFeedback || answered || eliminated.length > 0 || !(powerUps?.eliminate > 0);
  const hintDisabled = showFeedback || answered || hintUsed || !(powerUps?.hint > 0);
```

Render the bar directly above the options grid (before `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">`):

```jsx
      {onUseEliminate && onUseHint && (
        <PowerUpBar
          powerUps={powerUps}
          onUseEliminate={onUseEliminate}
          onUseHint={onUseHint}
          eliminateDisabled={eliminateDisabled}
          hintDisabled={hintDisabled}
        />
      )}
```

In the option button, honor elimination. Change the `onClick` guard:

```js
            onClick={() =>
              !showFeedback &&
              !answeredQuestions[questionKey]?.answered &&
              !eliminated.includes(index) &&
              onAnswer(index)
            }
```

Change `disabled={...}` to:

```js
            disabled={
              showFeedback ||
              answeredQuestions[questionKey]?.answered ||
              eliminated.includes(index)
            }
```

And prepend an eliminated style branch to the className ternary — replace the opening of the template literal:

```js
            className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-102 text-sm md:text-base ${
              eliminated.includes(index) && !answeredQuestions[questionKey]?.answered && !showFeedback
                ? 'bg-gray-800/60 border-gray-700 text-gray-600 line-through opacity-40 cursor-not-allowed'
                : answeredQuestions[questionKey]?.answered
```

(the rest of the existing ternary chain is unchanged).

- [ ] **Step 6: Add auto-send support to `ChatPanel.js`**

Change the component signature (~line 881):

```js
const ChatPanel = ({ isOpen, onClose, userName, gameContext, pendingMessage, onPendingMessageConsumed }) => {
```

Refactor `sendMessage` (~line 941) to accept content. Replace:

```js
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
```

with:

```js
  const sendMessageWithContent = async (content) => {
    const trimmed = (content || '').trim();
    if (!trimmed || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    };
```

Then rename nothing else inside the function body (it already reads `userMessage.content` for history and the request payload; `setInputValue('')` can stay). After the function's closing brace, add:

```js
  const sendMessage = () => sendMessageWithContent(inputValue);
```

(The existing Enter-key handler at ~line 1121 and send-button `onClick` at ~line 1551 keep calling `sendMessage()` unchanged.)

Add the auto-send effect after the existing "Focus input when panel opens" effect (~line 939):

```js
  // Auto-send a message queued by the game (e.g. the Hint power-up).
  useEffect(() => {
    if (isOpen && pendingMessage?.text && !isLoading) {
      sendMessageWithContent(pendingMessage.text);
      onPendingMessageConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pendingMessage?.id]);
```

- [ ] **Step 7: Wire state + handlers in `src/IFRS17TrainingGame.js`**

Add imports:

```js
import { INITIAL_POWER_UPS, canUsePowerUp, consumePowerUp } from './modules/powerUps';
import { pickEliminatedOptions } from './modules/questionUtils';
```

(The file already imports `INITIAL_POWER_UPS` — extend that import line.)

Add state next to `const [isChatOpen, setIsChatOpen] = useState(false);` (~line 85):

```js
  const [eliminatedOptions, setEliminatedOptions] = useState({}); // { "module-question": [i, j] }
  const [hintUsedQuestions, setHintUsedQuestions] = useState({}); // { "module-question": true }
  const [pendingChatMessage, setPendingChatMessage] = useState(null);
```

Add handlers AFTER the `useQuestionFlow(...)` destructuring (~line 224) — they reference `getShuffledQuestions` and `startNewModule`, which the hook returns:

```js
  const HINT_MESSAGE = 'Give me a hint for this question, without revealing the answer.';

  const handleUseEliminate = useCallback(() => {
    const questionKey = `${currentModule}-${currentQuestion}`;
    if (!canUsePowerUp(powerUps, 'eliminate')) return;
    if (eliminatedOptions[questionKey] || answeredQuestions[questionKey]?.answered) return;
    const questionData = getShuffledQuestions(currentModule)[currentQuestion];
    if (!questionData) return;
    setEliminatedOptions((prev) => ({
      ...prev,
      [questionKey]: pickEliminatedOptions(questionData),
    }));
    setPowerUps((prev) => consumePowerUp(prev, 'eliminate'));
  }, [currentModule, currentQuestion, powerUps, eliminatedOptions, answeredQuestions, getShuffledQuestions]);

  const handleUseHint = useCallback(() => {
    const questionKey = `${currentModule}-${currentQuestion}`;
    if (!canUsePowerUp(powerUps, 'hint')) return;
    if (hintUsedQuestions[questionKey] || answeredQuestions[questionKey]?.answered) return;
    setHintUsedQuestions((prev) => ({ ...prev, [questionKey]: true }));
    setPowerUps((prev) => consumePowerUp(prev, 'hint'));
    setPendingChatMessage({ text: HINT_MESSAGE, id: Date.now() });
    setIsChatOpen(true);
  }, [currentModule, currentQuestion, powerUps, hintUsedQuestions, answeredQuestions]);

  const launchModule = useCallback((moduleIndex) => {
    setEliminatedOptions({});
    setHintUsedQuestions({});
    startNewModule(moduleIndex);
  }, [startNewModule]);
```

Route module starts through `launchModule`:
- `<ModulesGrid ... onModuleSelect={startNewModule} ...>` → `onModuleSelect={launchModule}`
- In `ModuleCompleteModal`'s `onStartNext`: `startNewModule(currentModule + 1)` → `launchModule(currentModule + 1)`

Pass the new props to `QuestionPanel` (after `onAskHelp={...}`):

```jsx
            powerUps={powerUps}
            eliminatedOptions={eliminatedOptions[`${currentModule}-${currentQuestion}`]}
            hintUsed={!!hintUsedQuestions[`${currentModule}-${currentQuestion}`]}
            onUseEliminate={handleUseEliminate}
            onUseHint={handleUseHint}
```

Pass the new props to `ChatPanel` (after `gameContext={{...}}`):

```jsx
      pendingMessage={pendingChatMessage}
      onPendingMessageConsumed={() => setPendingChatMessage(null)}
```

- [ ] **Step 8: Run the full suite + manual smoke**

Run: `npm test -- --watchAll=false`
Expected: PASS.

Manual smoke (requires `npm start`; backend optional — hint send will error gracefully if the chatbot API is down, which is acceptable here): answer questions in Module 1 as a guest; verify Eliminate greys out two wrong options and decrements 2→1; verify Hint opens the chat and auto-sends; verify both buttons disable after the question is answered and re-enable on the next question; verify counts reset when starting a new module.

- [ ] **Step 9: Commit**

```bash
git add src/components/game/QuestionPanel/ src/components/ChatPanel.js src/IFRS17TrainingGame.js
git commit -m "feat: restore Eliminate and Hint power-ups with UI and chatbot auto-send"
```

---

### Task 7: Review missed questions after module completion

**Files:**
- Create: `src/components/game/ReviewPanel.js`
- Modify: `src/components/game/ModuleCompleteModal.js`
- Modify: `src/IFRS17TrainingGame.js`
- Test: `src/components/game/__tests__/ReviewPanel.test.js`

**Interfaces:**
- Consumes: `getMissedQuestions` from `src/modules/questionUtils` (Task 1).
- Produces:
  - `ReviewPanel` props: `{ questions: Array, moduleTitle: string, onExit: () => void }` — fully self-contained local state; no scoring/timer/persistence side effects.
  - New `ModuleCompleteModal` props: `{ missedCount: number, onReviewMissed: () => void }`

- [ ] **Step 1: Write the failing ReviewPanel test**

Create `src/components/game/__tests__/ReviewPanel.test.js`:

```js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewPanel from '../ReviewPanel';

const questions = [
  {
    question: 'First missed?',
    options: ['A', 'B', 'C', 'D'],
    correct: 1,
    explanation: 'B is right.',
    difficulty: 'standard',
  },
  {
    question: 'Second missed?',
    options: ['E', 'F', 'G', 'H'],
    correct: 0,
    explanation: 'E is right.',
    difficulty: 'expert',
  },
];

test('walks through missed questions showing the explanation after each answer', () => {
  const onExit = jest.fn();
  render(<ReviewPanel questions={questions} moduleTitle="Test Module" onExit={onExit} />);

  expect(screen.getByText(/review mode/i)).toBeInTheDocument();
  expect(screen.getByText('First missed?')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'C' })); // wrong on purpose
  expect(screen.getByText('B is right.')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /next question/i }));
  expect(screen.getByText('Second missed?')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'E' }));
  expect(screen.getByText('E is right.')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /finish review/i }));
  expect(onExit).toHaveBeenCalledTimes(1);
});

test('exit button leaves review immediately', () => {
  const onExit = jest.fn();
  render(<ReviewPanel questions={questions} moduleTitle="Test Module" onExit={onExit} />);
  fireEvent.click(screen.getByRole('button', { name: /exit review/i }));
  expect(onExit).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --watchAll=false ReviewPanel.test.js`
Expected: FAIL — `Cannot find module '../ReviewPanel'`

- [ ] **Step 3: Create `src/components/game/ReviewPanel.js`**

```jsx
import React, { useState } from 'react';
import { BookOpen, CheckCircle, XCircle, ArrowRight, X } from 'lucide-react';

// Post-module replay of missed questions. Deliberately self-contained:
// no score, XP, combo, timer, power-ups, or persistence.
const ReviewPanel = ({ questions, moduleTitle, onExit }) => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);

  if (!questions?.length) return null;

  const current = questions[index];
  const answered = selected !== null;
  const isLast = index === questions.length - 1;

  const handleNext = () => {
    if (isLast) {
      onExit();
      return;
    }
    setIndex(index + 1);
    setSelected(null);
  };

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-amber-400/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 bg-amber-900/40 border border-amber-400/40 text-amber-300 px-3 py-1.5 rounded-lg text-sm font-semibold uppercase tracking-wide">
            <BookOpen className="w-4 h-4" />
            Review mode
          </span>
          <h3 className="text-lg md:text-xl font-bold text-white">
            {moduleTitle} - Missed {index + 1}/{questions.length}
          </h3>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <X className="w-4 h-4" />
          Exit review
        </button>
      </div>

      <p className="text-amber-200/70 text-sm mb-4">
        No points, XP, or timer here — just another look at what you missed.
      </p>

      <p className="text-white text-base md:text-lg lg:text-xl font-semibold mb-4">
        {current.question}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {current.options.map((option, optionIndex) => (
          <button
            key={optionIndex}
            type="button"
            onClick={() => !answered && setSelected(optionIndex)}
            disabled={answered}
            className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-300 text-sm md:text-base text-left ${
              answered && optionIndex === current.correct
                ? 'bg-green-500/20 border-green-400 text-green-400'
                : answered && optionIndex === selected
                ? 'bg-red-500/20 border-red-400 text-red-400'
                : answered
                ? 'bg-gray-700/50 border-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{option}</span>
              {answered && optionIndex === current.correct && (
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              )}
              {answered && optionIndex === selected && optionIndex !== current.correct && (
                <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
              )}
            </div>
          </button>
        ))}
      </div>

      {answered && (
        <div className="mt-6 p-4 rounded-xl bg-blue-500/20 border border-blue-400">
          <p className="text-blue-400 font-semibold mb-2 text-sm md:text-base">
            {selected === current.correct ? '✅ Got it this time!' : 'Explanation:'}
          </p>
          <p className="text-gray-300 text-sm md:text-base">{current.explanation}</p>
          <button
            type="button"
            onClick={handleNext}
            className="mt-4 flex items-center gap-2 bg-amber-600/40 hover:bg-amber-600/60 border border-amber-400/40 text-amber-100 px-4 py-2 rounded-lg transition-all text-sm font-semibold"
          >
            <span>{isLast ? 'Finish review' : 'Next question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewPanel;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --watchAll=false ReviewPanel.test.js`
Expected: PASS

- [ ] **Step 5: Add the review button to `ModuleCompleteModal.js`**

Add `missedCount` and `onReviewMissed` to the props destructuring. Add `RotateCcw` to the lucide import. Insert directly above the `{/* Action button */}` comment:

```jsx
            {/* Review missed questions */}
            {missedCount > 0 && onReviewMissed && (
              <button
                onClick={onReviewMissed}
                className="w-full mb-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Review missed questions ({missedCount})</span>
              </button>
            )}
```

- [ ] **Step 6: Wire review mode in `src/IFRS17TrainingGame.js`**

Add imports:

```js
import ReviewPanel from './components/game/ReviewPanel';
import { pickEliminatedOptions, getMissedQuestions } from './modules/questionUtils';
```

(extend the Task 6 import line for `questionUtils`).

Add state next to the Task 6 state:

```js
  const [reviewQuestions, setReviewQuestions] = useState(null);
```

Compute missed questions before the `return` (after the `useQuestionFlow` destructuring so `shuffledQuestions` is in scope — it's from `gameState`, so anywhere after ~line 166 works):

```js
  const missedInCurrentModule = getMissedQuestions(
    shuffledQuestions[currentModule] || [],
    answeredQuestions,
    currentModule,
  );
```

Extend `ModuleCompleteModal` with the new props:

```jsx
          missedCount={missedInCurrentModule.length}
          onReviewMissed={() => {
            setShowModuleComplete(false);
            setReviewQuestions(missedInCurrentModule);
          }}
```

Render `ReviewPanel` directly after the `QuestionPanel` conditional block (they are mutually exclusive — `QuestionPanel` hides once the module is in `completedModules`):

```jsx
        {/* Review of missed questions (post module completion) */}
        {reviewQuestions && (
          <ReviewPanel
            questions={reviewQuestions}
            moduleTitle={modules[currentModule]?.title}
            onExit={() => {
              setReviewQuestions(null);
              setShowModuleComplete(true);
            }}
          />
        )}
```

Also clear review state in `launchModule` (Task 6) so starting the next module never leaves a stale panel:

```js
  const launchModule = useCallback((moduleIndex) => {
    setEliminatedOptions({});
    setHintUsedQuestions({});
    setReviewQuestions(null);
    startNewModule(moduleIndex);
  }, [startNewModule]);
```

Known edge (accepted in the spec conversation): for a guest completing Module 1, the deferred-auth modal appears ~3s after completion and may overlay review; existing behavior, leave as-is.

- [ ] **Step 7: Run the full suite + manual smoke**

Run: `npm test -- --watchAll=false`
Expected: PASS.

Manual smoke: complete Module 1 with at least one wrong answer → modal shows "Review missed questions (n)" → button opens review; wrong answers show explanation; Finish returns to the completion modal; "Start Next Module" still works and clears review.

- [ ] **Step 8: Commit**

```bash
git add src/components/game/ReviewPanel.js src/components/game/__tests__/ReviewPanel.test.js src/components/game/ModuleCompleteModal.js src/IFRS17TrainingGame.js
git commit -m "feat: add post-module review of missed questions"
```

---

### Task 8: Documentation housekeeping + final verification

**Files:**
- Modify: `README.md`
- Modify: `src/components/GameGuideFAQ.js`
- Modify: `CLAUDE.md`

**Interfaces:** none — copy changes only.

- [ ] **Step 1: Fix `README.md`**

Apply these replacements (locate by quoted text; line numbers approximate):

- Line ~12: `- **Progressive Module System**: 9 comprehensive training modules covering all aspects of IFRS 17` → `- **Progressive Module System**: 15 comprehensive training modules covering all aspects of IFRS 17`
- Line ~13 (after the Fisher-Yates bullet), add a bullet: `- **Difficulty Tiers**: Every question is tagged Beginner/Standard/Expert; modules ramp up in difficulty and harder questions earn more XP`
- Line ~15: `- **Power-ups**: Strategic game elements including hints, answer elimination, and question skipping` → `- **Power-ups**: Eliminate (remove two wrong options) and Hint (ask the AI assistant), limited per module`
- Line ~64: `- **Modules**: 9 training modules with 200+ questions` → `- **Modules**: 15 training modules with 300+ questions, generated from a CSV question bank (see below)`
- Line ~130: `4. **Power-up Strategy**: Use hints, elimination, and skips strategically` → `4. **Power-up Strategy**: Use Hint and Eliminate strategically — allowances reset each module`
- Lines ~155–160, replace the power-ups code block:

```
INITIAL_POWER_UPS = {
  eliminate: 2, // Remove two wrong answers
  hint: 3       // Ask the AI assistant for a hint
}
```

- Line ~252: `- **Total Questions**: 200+ across 9 modules` → `- **Total Questions**: 300+ across 15 modules`
- Line ~255: `- **Power-up Types**: 3 strategic game enhancers` → `- **Power-up Types**: 2 strategic game enhancers (Eliminate, Hint)`
- Add a new section (place it near the setup/development sections):

```markdown
### Updating Question Content

The question bank lives in `questions/ifrs17_questions_choices_explanations excel database.csv`
(columns: Module No, Module Name, Complexity, Question, Option 1–4, Correct Answer, Explanation).
`src/data/IFRS17Modules.js` is GENERATED from it — never edit the JS file by hand.

1. Edit the CSV (keep Complexity one of Beginner/Standard/Expert; Correct Answer must exactly match one option).
2. Run `npm run generate:questions` — it validates every row and refuses to write on any error.
3. Commit both the CSV and the regenerated `src/data/IFRS17Modules.js`.
```

- [ ] **Step 2: Fix `src/components/GameGuideFAQ.js`**

- Line ~66: `Hint, Eliminate, and Skip provide advantages. Skipping moves you to the next question but breaks the perfect run. Availability is limited per module.` → `Eliminate removes two wrong options; Hint asks the AI assistant for a nudge without revealing the answer. Availability is limited per module and resets when a new module starts. Using power-ups never breaks a perfect run.`
- Line ~78: `<li>“Perfect Module” = no wrong or skipped answers.</li>` → `<li>“Perfect Module” = no wrong answers.</li>`
- Line ~86: `Completing a module without any wrong or skipped answers. You’ll see a “Perfect” highlight on completion and in leaderboards.` → `Completing a module without any wrong answers. You’ll see a “Perfect” highlight on completion and in leaderboards.`
- Line ~88 (the QA duplicate of line 66): apply the same replacement as line 66.
- Line ~112: `<li>Power‑ups: powerUps.js (canUsePowerUp, consumePowerUp, getPowerUpInfo)</li>` — leave, still accurate.

- [ ] **Step 3: Fix `CLAUDE.md`**

Replace `Question content for all 9 modules is in src/data/IFRS17Modules.js.` with:

```
Question content for all 15 modules is GENERATED into src/data/IFRS17Modules.js from
questions/ifrs17_questions_choices_explanations excel database.csv via `npm run generate:questions`
(script: scripts/generate-modules.js). Edit the CSV, not the JS file.
```

(Locate the sentence in the Architecture → Frontend section; adjust to fit the surrounding sentence structure.)

- [ ] **Step 4: Final full verification**

```bash
npm test -- --watchAll=false
npm run test:generator
npm run build
```

Expected: all tests PASS; production build succeeds with no ESLint errors (CI treats warnings as errors on Vercel).

- [ ] **Step 5: Commit**

```bash
git add README.md src/components/GameGuideFAQ.js CLAUDE.md
git commit -m "docs: update README, FAQ, CLAUDE.md for 15 modules, difficulty tiers, new power-ups"
```

---

## Post-plan checklist (not tasks)

- Open a PR from `feature/difficulty-gameplay` → `main` (repo convention: PR merges, see recent history).
- Out of scope reminders: leaderboard changes, chatbot roadmap, Supabase cutover, a11y pass, `.gitignore` change (Robin's, leave uncommitted).
