import test from 'node:test';
import assert from 'node:assert/strict';
import { nodes, connections, locations } from '../src/data/campus.js';
import { findRoute } from '../src/utils/routes.js';

test('south path includes the crossing and branches and the confirmed north-south connection', () => {
  const route = findRoute(nodes, connections, 'mall-path', 'business-path');
  assert.ok(route);
  assert.ok(route.path.includes('crossing-west'));
  assert.ok(route.path.includes('crossing-east'));
  const joined = findRoute(nodes, connections, 'student-entry', 'business-path');
  assert.ok(joined);
  assert.ok(joined.path.includes('map-edge') && joined.path.includes('south-start'));
});

test('all route coordinates and connections refer to mapped nodes', () => {
  const ids = new Set(nodes.map(node => node.id));
  assert.equal(ids.size, nodes.length);
  for (const node of nodes) assert.ok(node.x >= 0 && node.x <= 100 && node.y >= 0 && node.y <= 100);
  for (const edge of connections) assert.ok(ids.has(edge.from) && ids.has(edge.to) && edge.distance > 0);
  assert.equal(locations.filter(node => node.id === 'multimedia-path').length, 1);
});


test('hostel and mall paths use the user-confirmed crossings', () => {
  const hospitalToHostel = findRoute(nodes, connections, 'hospital-path', 'gh1-path');
  assert.ok(hospitalToHostel.path.includes('south-west-bend-1'));
  const hostelToHostel = findRoute(nodes, connections, 'gh2-path', 'gh3-path');
  assert.deepEqual(hostelToHostel.path, ['gh2-path', 'gh3-path']);
  const hostelToMall = findRoute(nodes, connections, 'gh2-path', 'mall-path');
  assert.ok(hostelToMall.path.includes('gh2-south-middle'));
  assert.ok(hostelToMall.path.includes('mall-midpoint'));
});
