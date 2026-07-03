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
