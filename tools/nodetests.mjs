// Runs every Node test file (tools/*test*.mjs, src/*.test.mjs) with `node --test` (#357).
// Files that start a browser (they import playwright) need Chromium and stay manual, per issue.
import {readdirSync, readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const pick = (dir, re) => readdirSync(dir).filter((f) => re.test(f)).sort().map((f) => `${dir}/${f}`);
const all = [...pick('tools', /test.*\.mjs$/), ...pick('src', /\.test\.mjs$/)].filter((f) => f !== 'tools/nodetests.mjs');
const browser = all.filter((f) => /playwright/.test(readFileSync(f, 'utf8')));
const files = all.filter((f) => !browser.includes(f));
console.log(`node tests: ${files.length} files; browser files left to manual runs: ${browser.join(', ') || 'none'}`);
const run = spawnSync(process.execPath, ['--test', '--test-reporter=dot', ...files], {stdio: 'inherit'});
process.exit(run.status ?? 1);
