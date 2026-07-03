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
