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
