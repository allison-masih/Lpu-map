/**
 * Convert a GPS fix to percentages on an image using three surveyed reference
 * points. Calibration cannot correct non-linear distortion in a schematic map;
 * survey and validate the whole area before using this for live navigation.
 * No calibration data or real-world position is assumed by this utility.
 *
 * @param {{latitude: number, longitude: number}} position
 * @param {Array<{latitude: number, longitude: number, x: number, y: number}>} anchors
 * @returns {{x: number, y: number} | null} Percent coordinates, or null for
 *          invalid/degenerate inputs or a fix outside the supplied map.
 */
export function mapGpsToMap(position, anchors) {
  const validGps = p => p && Number.isFinite(p.latitude) && Math.abs(p.latitude) <= 90 &&
    Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180;
  const validAnchor = p => validGps(p) && Number.isFinite(p.x) && p.x >= 0 && p.x <= 100 &&
    Number.isFinite(p.y) && p.y >= 0 && p.y <= 100;
  if (!validGps(position) || !Array.isArray(anchors) || anchors.length !== 3 || !anchors.every(validAnchor)) return null;
  const [origin, first, second] = anchors;
  const ax = first.longitude - origin.longitude;
  const ay = first.latitude - origin.latitude;
  const bx = second.longitude - origin.longitude;
  const by = second.latitude - origin.latitude;
  const determinant = ax * by - ay * bx;
  const scale = Math.hypot(ax, ay) * Math.hypot(bx, by);
  // Disallow duplicate and nearly collinear anchors, which magnify GPS error.
  if (!scale || Math.abs(determinant) / scale < 1e-6) return null;
  const mapAx = first.x - origin.x;
  const mapAy = first.y - origin.y;
  const mapBx = second.x - origin.x;
  const mapBy = second.y - origin.y;
  const mapScale = Math.hypot(mapAx, mapAy) * Math.hypot(mapBx, mapBy);
  if (!mapScale || Math.abs(mapAx * mapBy - mapAy * mapBx) / mapScale < 1e-6) return null;
  const dx = position.longitude - origin.longitude;
  const dy = position.latitude - origin.latitude;
  const u = (dx * by - dy * bx) / determinant;
  const v = (ax * dy - ay * dx) / determinant;
  const x = origin.x + u * (first.x - origin.x) + v * (second.x - origin.x);
  const y = origin.y + u * (first.y - origin.y) + v * (second.y - origin.y);
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) return null;
  return { x, y };
}
