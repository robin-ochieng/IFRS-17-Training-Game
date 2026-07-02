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
