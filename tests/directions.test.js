import test from 'node:test';
import assert from 'node:assert/strict';
import { getDirections } from '../src/utils/directions.js';
import { nodes, connections, mapWidth, mapHeight } from '../src/data/campus.js';
import { findRoute } from '../src/utils/routes.js';

const p = (id, x, y) => ({ id, x: x / mapWidth * 100, y: y / mapHeight * 100 });
test('identifies right and left based on travel direction', () => {
  const path = [p('a', 0, 0), p('b', 0, 100), p('c', 100, 100)];
  assert.match(getDirections(path)[1].text, /left/);
  assert.match(getDirections([...path].reverse())[1].text, /right/);
});
test('straight segments do not generate turns', () => {
  assert.deepEqual(getDirections([p('a', 0, 0), p('b', 0, 100), p('c', 0, 200)]).map(s => s.type), ['start', 'arrive']);
});
test('same location and missing input are handled', () => {
  assert.equal(getDirections([p('a', 1, 2)])[0].type, 'arrive');
  assert.deepEqual(getDirections([]), []);
});
test('real route turns at park junction without routing to building doors', () => {
  const route = findRoute(nodes, connections, 'student-entry', 'design-path');
  const path = route.path.map(id => nodes.find(n => n.id === id));
  const steps = getDirections(path);
  assert.equal(steps[0].nodeId, 'student-entry');
  assert.ok(steps.some(s => s.type === 'turn' && s.text.includes('left')));
  assert.equal(steps.at(-1).nodeId, 'design-path');
});
