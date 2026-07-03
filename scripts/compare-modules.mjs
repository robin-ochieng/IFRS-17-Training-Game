// scripts/compare-modules.mjs
// Semantic diff of two IFRS17Modules files (ignores the difficulty field).
// Usage: node scripts/compare-modules.mjs <old-file.mjs> <new-file.mjs>
// Files must be ESM (the data file already is; copy .js -> .mjs before use).
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const [oldPath, newPath] = process.argv.slice(2);
if (!oldPath || !newPath) {
  console.error('Usage: node scripts/compare-modules.mjs <old.mjs> <new.mjs>');
  process.exit(2);
}
const oldModules = (await import(pathToFileURL(resolve(oldPath)))).modules;
const newModules = (await import(pathToFileURL(resolve(newPath)))).modules;

const diffs = [];
if (oldModules.length !== newModules.length) {
  diffs.push(`module count: ${oldModules.length} -> ${newModules.length}`);
}
oldModules.forEach((om, mi) => {
  const nm = newModules[mi];
  if (!nm) return;
  if (om.title !== nm.title) diffs.push(`module ${mi + 1} title: ${JSON.stringify(om.title)} -> ${JSON.stringify(nm.title)}`);
  if (om.questions.length !== nm.questions.length) diffs.push(`module ${mi + 1} question count: ${om.questions.length} -> ${nm.questions.length}`);
  om.questions.forEach((oq, qi) => {
    const nq = nm.questions[qi];
    if (!nq) return;
    const tag = `module ${mi + 1} question ${qi + 1}`;
    if (oq.question !== nq.question) diffs.push(`${tag}: text differs`);
    if (JSON.stringify(oq.options) !== JSON.stringify(nq.options)) diffs.push(`${tag}: options differ`);
    if (oq.correct !== nq.correct) diffs.push(`${tag}: correct ${oq.correct} -> ${nq.correct}`);
    if (oq.explanation !== nq.explanation) diffs.push(`${tag}: explanation differs`);
  });
});
console.log(diffs.length ? diffs.join('\n') : 'CONTENT IDENTICAL (ignoring difficulty)');
