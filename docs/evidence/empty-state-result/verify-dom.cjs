// Reproduce after npm run build in app/.
// npm install --prefix /tmp/clara-dom-check --no-save --no-package-lock jsdom@26.1.0
// node docs/evidence/empty-state-result/verify-dom.cjs /tmp/clara-dom-check/node_modules/jsdom
// DOM smoke check of the production bundle; not a browser/accessibility audit.
const { readFileSync, readdirSync } = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require(process.argv[2] || 'jsdom');
const root = path.resolve(__dirname, '../../..');
const failures = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', error => failures.push(error.message));
const dom = new JSDOM('<!doctype html><div id="root"></div>', {
  url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole,
});
const assets = path.join(root, 'app/dist/assets');
const bundle = readdirSync(assets).find(name => name.endsWith('.js'));
dom.window.eval(readFileSync(path.join(assets, bundle), 'utf8'));
const doc = dom.window.document;
const tick = () => new Promise(resolve => setTimeout(resolve, 30));
const report = [];
const check = (name, fn) => { fn(); report.push({ name, result: 'pass' }); };
const text = () => doc.querySelector('[role="status"]').textContent;
async function submit(value) {
  const input = doc.querySelector('input');
  Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(input, value);
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  await tick();
  doc.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  await tick();
}
(async () => {
  await tick();
  check('Initial result region is empty', () => assert.equal(text(), ''));
  const empty = JSON.parse(readFileSync(path.join(root, 'docs/knowledge/empty-state.json')));
  const destructive = JSON.parse(readFileSync(path.join(root, 'docs/knowledge/destructive-confirmation.json')));
  [...doc.querySelectorAll('button')].find(b => b.textContent === empty.demonstratedIntent.value).click();
  await tick();
  check('Existing suggestion fills intent from Knowledge', () => assert.equal(doc.querySelector('input').value, empty.demonstratedIntent.value));
  doc.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  await tick();
  check('Empty State displays its assumption, limitations and conditional actions', () => {
    for (const expected of [empty.pattern, empty.recordStatus, empty.scopedScenario.value, ...empty.whenNotToUse.value, ...empty.actionAvailability.value]) assert.ok(text().includes(expected), expected);
    assert.ok(!text().includes(destructive.pattern));
  });
  await submit('  SHOW THAT THERE IS NO CONTENT YET...  ');
  check('Normalized Empty State phrase matches', () => assert.ok(text().includes(empty.pattern)));
  await submit(destructive.demonstratedIntent.value);
  check('Existing destructive result replaces Empty State', () => {
    assert.ok(text().includes(destructive.pattern)); assert.ok(!text().includes(empty.pattern));
  });
  await submit('Help users recover from an error');
  check('Unsupported intent clears both results and lists both demonstrations', () => {
    assert.ok(text().includes("doesn't have a confident match"));
    assert.ok(text().includes(empty.demonstratedIntent.value));
    assert.ok(text().includes(destructive.demonstratedIntent.value));
    assert.equal(doc.querySelectorAll('h2').length, 0);
  });
  await submit('Confirm a risky action');
  check('Generic risky action still does not overmatch', () => assert.equal(doc.querySelectorAll('h2').length, 0));
  await submit('   ');
  check('Whitespace submit clears the prior result', () => assert.equal(text(), ''));
  check('Bundle produced no captured DOM runtime errors', () => assert.deepEqual(failures, []));
  console.log(JSON.stringify({ environment: 'Node + jsdom 26.1.0; production bundle; no visual or keyboard validation', checks: report }, null, 2));
  dom.window.close();
})().catch(error => { console.error(error); dom.window.close(); process.exitCode = 1; });
