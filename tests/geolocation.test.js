import test from 'node:test';
import assert from 'node:assert/strict';
import { mapGpsToMap } from '../src/utils/geolocation.js';

const anchors = [
  { latitude: 31, longitude: 75, x: 10, y: 10 },
  { latitude: 31, longitude: 75.001, x: 90, y: 10 },
  { latitude: 31.001, longitude: 75, x: 10, y: 90 },
];

test('maps surveyed points and interpolates within the map', () => {
  assert.deepEqual(mapGpsToMap(anchors[0], anchors), { x: 10, y: 10 });
  const p = mapGpsToMap({ latitude: 31.0005, longitude: 75.0005 }, anchors);
  assert.ok(Math.abs(p.x - 50) < 1e-7);
  assert.ok(Math.abs(p.y - 50) < 1e-7);
});
test('rejects unconfigured, invalid and outside map inputs', () => {
  assert.equal(mapGpsToMap({ latitude: 31, longitude: 75 }, []), null);
  assert.equal(mapGpsToMap({ latitude: NaN, longitude: 75 }, anchors), null);
  assert.equal(mapGpsToMap({ latitude: 91, longitude: 75 }, anchors), null);
  assert.equal(mapGpsToMap({ latitude: 31, longitude: 76 }, anchors), null);
  assert.equal(mapGpsToMap(anchors[0], [{ ...anchors[0], x: -1 }, ...anchors.slice(1)]), null);
});
test('rejects duplicate and collinear geographic anchors', () => {
  assert.equal(mapGpsToMap(anchors[0], [anchors[0], anchors[0], anchors[2]]), null);
  assert.equal(mapGpsToMap(anchors[0], [anchors[0], anchors[1], { ...anchors[1], longitude: 75.002 }]), null);
  assert.equal(mapGpsToMap(anchors[0], [anchors[0], anchors[1], { ...anchors[2], x: 50, y: 10 }]), null);
});
