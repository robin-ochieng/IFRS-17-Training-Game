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
