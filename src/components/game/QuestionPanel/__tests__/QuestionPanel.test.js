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
