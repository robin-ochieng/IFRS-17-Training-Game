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
