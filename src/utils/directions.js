// Directions describe the drawing only; they are not live GPS guidance.
// Coordinates in campus.js are percentages of the SVG viewBox.
import { mapWidth as WIDTH, mapHeight as HEIGHT } from '../data/campus.js';
const RADIUS = 24; // smoothing distance in image pixels, not metres
const MIN_TURN = Math.PI / 6;

function sample(points, distances, distance) {
  if (distance <= 0) return points[0];
  const last = distances.length - 1;
  if (distance >= distances[last]) return points[last];
  let i = 1;
  while (distances[i] < distance) i++;
  const length = distances[i] - distances[i - 1];
  if (!length) return points[i];
  const t = (distance - distances[i - 1]) / length;
  return { x: points[i - 1].x + t * (points[i].x - points[i - 1].x), y: points[i - 1].y + t * (points[i].y - points[i - 1].y) };
}

function compass(dx, dy) {
  const directions = ['east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'north', 'northeast'];
  return directions[((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8];
}

/**
 * Creates approximate instructions for a path already computed by findRoute.
 * @param {Array<{id:string,x:number,y:number,name?:string}>} path ordered route nodes
 * @returns {Array<{type:string,text:string,nodeId:string,pointIndex:number}>}
 */
export function getDirections(path) {
  if (!Array.isArray(path) || !path.length || path.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y))) return [];
  const end = path[path.length - 1];
  if (path.length === 1) return [{ type: 'arrive', text: `You are already at ${end.name || 'your selected point'}.`, nodeId: end.id, pointIndex: 0 }];
  const points = path.map(p => ({ x: p.x * WIDTH / 100, y: p.y * HEIGHT / 100 }));
  const distances = [0];
  for (let i = 1; i < points.length; i++) distances.push(distances[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  const total = distances[distances.length - 1];
  if (!total) return [{ type: 'arrive', text: `You are already at ${end.name || 'your selected point'}.`, nodeId: end.id, pointIndex: path.length - 1 }];
  const first = sample(points, distances, Math.min(RADIUS, total));
  const result = [{ type: 'start', text: `Head ${compass(first.x - points[0].x, first.y - points[0].y)} along the footpath.`, nodeId: path[0].id, pointIndex: 0 }];
  const candidates = [];
  for (let i = 1; i < points.length - 1; i++) {
    const before = sample(points, distances, Math.max(0, distances[i] - RADIUS));
    const after = sample(points, distances, Math.min(total, distances[i] + RADIUS));
    const a = { x: points[i].x - before.x, y: points[i].y - before.y };
    const b = { x: after.x - points[i].x, y: after.y - points[i].y };
    if (!Math.hypot(a.x, a.y) || !Math.hypot(b.x, b.y)) continue;
    const angle = Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);
    if (Math.abs(angle) >= MIN_TURN) candidates.push({ i, angle, distance: distances[i] });
  }
  // Several nearby points can describe one rounded corner; keep the strongest.
  const turns = [];
  for (const candidate of candidates) {
    const last = turns[turns.length - 1];
    if (last && candidate.distance - last.distance < RADIUS * 2 && Math.sign(candidate.angle) === Math.sign(last.angle)) {
      if (Math.abs(candidate.angle) > Math.abs(last.angle)) turns[turns.length - 1] = candidate;
    } else turns.push(candidate);
  }
  for (const turn of turns) {
    const direction = Math.abs(turn.angle) > Math.PI * 5 / 6 ? 'Make a U-turn' : turn.angle > 0 ? 'Turn right' : 'Turn left';
    result.push({ type: 'turn', text: `${direction} and continue on the footpath.`, nodeId: path[turn.i].id, pointIndex: turn.i });
  }
  result.push({ type: 'arrive', text: `Arrive at ${end.name || 'your selected path point'}.`, nodeId: end.id, pointIndex: path.length - 1 });
  return result;
}
