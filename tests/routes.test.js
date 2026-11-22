import test from 'node:test';
import assert from 'node:assert/strict';
import { findRoute } from '../src/utils/routes.js';

const points = ['entry', 'turn', 'park', 'hospital', 'isolated'].map(id => ({ id }));
const paths = [
  { from: 'entry', to: 'turn', distance: 2 },
  { from: 'turn', to: 'park', distance: 2 },
  { from: 'park', to: 'hospital', distance: 2 },
  { from: 'entry', to: 'hospital', distance: 9 },
];

test('selects the shortest connected path including intermediate turns', () => {
  assert.deepEqual(findRoute(points, paths, 'entry', 'hospital'), {
    path: ['entry', 'turn', 'park', 'hospital'], distance: 6,
  });
});

test('walking paths can be traversed in either direction', () => {
  assert.deepEqual(findRoute(points, paths, 'hospital', 'entry'), {
    path: ['hospital', 'park', 'turn', 'entry'], distance: 6,
  });
});

test('unknown and disconnected points have no route', () => {
  assert.equal(findRoute(points, paths, 'entry', 'isolated'), null);
  assert.equal(findRoute(points, paths, 'entry', 'unknown'), null);
});

test('same start and end results in a zero-length route', () => {
  assert.deepEqual(findRoute(points, paths, 'park', 'park'), { path: ['park'], distance: 0 });
});

test('does not use non-positive edges or edges to unknown points', () => {
  const invalidPaths = [{ from: 'entry', to: 'hospital', distance: -1 }, { from: 'entry', to: 'ghost', distance: 1 }, { from: 'ghost', to: 'hospital', distance: 1 }];
  assert.equal(findRoute(points, invalidPaths, 'entry', 'hospital'), null);
});
