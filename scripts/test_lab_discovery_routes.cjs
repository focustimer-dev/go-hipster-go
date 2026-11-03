// Behavioral checks for the shipped route deck. Run with Node; no packages needed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const index = JSON.parse(fs.readFileSync(path.join(__dirname, '../android-lab/web/discovery-route-index.json'), 'utf8'));
const source = fs.readFileSync(path.join(__dirname, '../android-lab/web/discovery-routes.js'), 'utf8')
  .replace('/*LAB_ROUTE_INDEX*/', JSON.stringify(index));
const key = 'ghg-lab-discovery-routes-v1';
const ids = index.routes.map(route => route.id);
const family = id => index.routes.find(route => route.id === id).family;
assert.equal(new Set(ids).size, ids.length, 'Route IDs must be unique');
assert.equal(ids.length, 24, 'The shipped v1 deck contains 24 routes');

function load(storage, secure = true) {
  let draws = 0;
  const context = vm.createContext({
    stored: name => storage.get(name),
    store: (name, value) => storage.set(name, value),
    // Fixed shuffle input makes failures reproducible; tests assert behavior, not order.
    ...(secure ? {crypto: {getRandomValues(array) { array[0] = 0; draws++; return array; }}} :
      {Math: Object.assign(Object.create(Math), {random() { draws++; return 0; }})}),
  });
  vm.runInContext(source, context);
  return {
    next: () => vm.runInContext('nextLabDiscoveryRoute()', context),
    state: () => JSON.parse(storage.get(key)),
    shuffleDraws: () => draws,
  };
}

for (const secure of [true, false]) {
  const storage = new Map();
  let app = load(storage, secure);
  for (let cycle = 0; cycle < 4; cycle++) {
    const seen = new Set();
    for (let turn = 0; turn < ids.length; turn++) {
      const before = storage.has(key) ? app.state() : {remaining: [], recent: []};
      const available = before.remaining.length ? before.remaining : ids;
      const previous = before.recent.at(-1);
      const alternatives = available.filter(id => family(id) !== (previous && family(previous)));
      const fresh = alternatives.filter(id => !before.recent.slice(-8).includes(id));
      const result = app.next();
      if (turn === 0) assert(app.shuffleDraws() > 0, 'Exercise the selected random source');
      assert.match(result, /^v1\/R\d{2}$/);
      const id = result.split('/')[1];
      assert(ids.includes(id));
      assert(!seen.has(id), 'A route must not repeat before its deck is exhausted');
      if (fresh.length) assert(fresh.includes(id), 'Prefer a new family outside the recent eight');
      else if (alternatives.length) assert(alternatives.includes(id), 'Avoid adjacent families when possible');
      seen.add(id);
      assert(app.state().recent.length <= 30, 'History remains bounded');
      assert.deepEqual(Object.keys(app.state()).sort(), ['recent', 'remaining'], 'Persist route IDs only');
      if (turn === 8) {
        const saved = storage.get(key);
        app = load(storage, secure);
        assert.equal(storage.get(key), saved, 'Reload must not consume a route');
      }
    }
    assert.equal(seen.size, ids.length);
  }
}

for (const broken of ['{', 'null', '42', '"bad"', '{}', '{"remaining":"bad","recent":false}']) {
  const app = load(new Map([[key, broken]]));
  assert(ids.includes(app.next().split('/')[1]), 'Malformed storage recovers with a valid route');
}
const repaired = load(new Map([[key, JSON.stringify({remaining: ['unknown', 'R01', 'R01', 'R02'], recent: ['unknown']})]]));
assert(['v1/R01', 'v1/R02'].includes(repaired.next()));
assert.equal(repaired.state().remaining.length, 1, 'Unknown and duplicate stored routes are discarded');
assert(repaired.state().recent.every(id => ids.includes(id)));
console.log('PASS: complete decks, reload persistence, bounded history, family/recent avoidance, both random sources and corrupt-state recovery.');
