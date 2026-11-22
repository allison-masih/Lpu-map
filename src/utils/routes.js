export function findRoute(locations, connections, start, end) {
  if (!locations.some(p => p.id === start) || !locations.some(p => p.id === end)) return null;
  const distances = new Map(locations.map(p => [p.id, Infinity]));
  const previous = new Map();
  const remaining = new Set(locations.map(p => p.id));
  distances.set(start, 0);
  while (remaining.size) {
    const current = [...remaining].reduce((a, b) => distances.get(a) <= distances.get(b) ? a : b);
    if (distances.get(current) === Infinity) break;
    remaining.delete(current);
    if (current === end) break;
    for (const edge of connections) {
      if (!(edge.distance > 0)) continue;
      const next = edge.from === current ? edge.to : edge.to === current ? edge.from : null;
      if (next && remaining.has(next) && distances.get(current) + edge.distance < distances.get(next)) {
        distances.set(next, distances.get(current) + edge.distance);
        previous.set(next, current);
      }
    }
  }
  if (distances.get(end) === Infinity) return null;
  const path = [end];
  while (path[0] !== start) path.unshift(previous.get(path[0]));
  return { path, distance: distances.get(end) };
}
