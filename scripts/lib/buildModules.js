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
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    // The CSV has ~12 unnamed trailing columns; give them unique names so
    // papaparse doesn't console.warn about duplicate headers on every parse.
    transformHeader: (header, index) => header || `_unnamed_${index}`,
  });
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

    // Exact option-text match takes priority. A bare 1-4 digit only falls back
    // to positional interpretation when it doesn't literally match any option
    // (e.g. options ["2","3","4","6"] with Correct Answer "3" must grade the
    // matching option text at index 1, not position 3 / index 2).
    const correctRaw = (row[cols.correct] || '').trim();
    let correct = options.indexOf(correctRaw);
    if (correct < 0 && /^[1-4]$/.test(correctRaw)) {
      correct = parseInt(correctRaw, 10) - 1;
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
