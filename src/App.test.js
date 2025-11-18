import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('./IFRS17TrainingGame', () => () => <div>Training Game Ready</div>);

describe('App bootstrap experience', () => {
  test('eventually renders the game shell', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText(/training game ready/i)).toBeInTheDocument());
  });
});
