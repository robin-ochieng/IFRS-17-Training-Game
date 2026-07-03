import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatPanel from '../ChatPanel';

const HINT_TEXT = 'Give me a hint for this question, without revealing the answer.';
const DISTINCT_QUESTION_TEXT = 'DISTINCTIVE_QUESTION_TEXT_FOR_AUTOSEND_TEST';

const baseGameContext = {
  currentModuleIndex: 0,
  currentModuleTitle: 'Test Module',
  currentModuleIcon: '📘',
  currentQuestionIndex: 0,
  currentQuestionText: DISTINCT_QUESTION_TEXT,
  currentQuestionOptions: ['A', 'B', 'C', 'D'],
  currentQuestionExplanation: 'Because reasons.',
  isModuleCompleted: false,
  completedModules: [],
  userLevel: 1,
  totalScore: 0,
};

const getChatInput = () => screen.getByPlaceholderText(/ask about ifrs 17/i);

// Mirrors how IFRS17TrainingGame.js wires ChatPanel: pendingMessage lives in
// the parent's state and is cleared via onPendingMessageConsumed. Using a
// real stateful parent (instead of a static prop) reproduces that clearing
// behavior, which matters because ChatPanel's auto-send effect also
// re-evaluates whenever isLoading flips back to false.
const PendingMessageHarness = ({ initialPendingMessage, onConsumed, ...chatPanelProps }) => {
  const [pendingMessage, setPendingMessage] = React.useState(initialPendingMessage);
  const handleConsumed = () => {
    setPendingMessage(null);
    onConsumed?.();
  };
  return (
    <ChatPanel
      {...chatPanelProps}
      pendingMessage={pendingMessage}
      onPendingMessageConsumed={handleConsumed}
    />
  );
};

beforeAll(() => {
  // jsdom does not implement scrollIntoView; ChatPanel calls it whenever
  // the message list updates.
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  // Network failure is fine here — these tests assert the outgoing call,
  // not the response.
  global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
});

afterEach(() => {
  jest.clearAllMocks();
});

test('auto-sends a queued pending message with the displayed question in game context, and does not resend once consumed', async () => {
  const onPendingMessageConsumed = jest.fn();
  const onClose = jest.fn();

  const { rerender } = render(
    <PendingMessageHarness
      isOpen
      onClose={onClose}
      userName="Robin"
      gameContext={baseGameContext}
      initialPendingMessage={{ text: HINT_TEXT, id: 1 }}
      onConsumed={onPendingMessageConsumed}
    />
  );

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/chat\/stream$/);

  const body = JSON.parse(options.body);
  expect(body.message).toBe(HINT_TEXT);
  expect(body.game_context.current_question_text).toBe(DISTINCT_QUESTION_TEXT);

  expect(onPendingMessageConsumed).toHaveBeenCalled();

  // Let the rejected fetch's catch handler settle (isLoading flips back to
  // false) — the pendingMessage was already cleared above, so this must not
  // trigger a second network call.
  expect(await screen.findByText(/couldn.t connect to the server/i)).toBeInTheDocument();

  expect(global.fetch).toHaveBeenCalledTimes(1);

  // A further render/update with pendingMessage still null must not fetch again.
  rerender(
    <PendingMessageHarness
      isOpen
      onClose={onClose}
      userName="Robin"
      gameContext={baseGameContext}
      initialPendingMessage={null}
      onConsumed={onPendingMessageConsumed}
    />
  );

  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test("preserves the user's in-progress draft when a hint auto-sends", async () => {
  const onPendingMessageConsumed = jest.fn();
  const onClose = jest.fn();
  const draftText = 'my half-typed question about CSM';

  const { rerender } = render(
    <ChatPanel
      isOpen
      onClose={onClose}
      userName="Robin"
      gameContext={baseGameContext}
      pendingMessage={null}
      onPendingMessageConsumed={onPendingMessageConsumed}
    />
  );

  fireEvent.change(getChatInput(), { target: { value: draftText } });
  expect(getChatInput().value).toBe(draftText);

  rerender(
    <ChatPanel
      isOpen
      onClose={onClose}
      userName="Robin"
      gameContext={baseGameContext}
      pendingMessage={{ text: HINT_TEXT, id: 2 }}
      onPendingMessageConsumed={onPendingMessageConsumed}
    />
  );

  await waitFor(() => expect(onPendingMessageConsumed).toHaveBeenCalled());

  expect(getChatInput().value).toBe(draftText);
});
