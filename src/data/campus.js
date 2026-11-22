// Walking paths are based on the supplied sketches and later user-confirmed connections.
// The user confirmed the north/south path is continuous.
// Coordinates are percentages of the image; distances are relative image pixels,
// not metres or walking times. Stops indicate points on the path near landmarks,
// not confirmed entrances. Hidden vertices preserve bends and intersections.
export const mapWidth = 1536;
const width = mapWidth;
const xOffset = 450;
export const mapHeight = 2700;
const height = mapHeight;
const point = (id, px, py, name, category) => ({
  id, x: (px + xOffset) / width * 100, y: py / height * 100,
  ...(name ? { name, category } : {}),
});

export const nodes = [
  point('student-entry', 669, 90, 'Student main entry', 'Walking path'),
  point('id-check', 669, 201, 'Path by ID card check', 'Walking path'),
  point('north-junction', 669, 229),
  point('north-west-curve-1', 489, 229),
  point('north-west-curve-2', 474, 234),
  point('north-west-curve-3', 465, 248),
  point('west-straight', 465, 720),
  point('south-west-curve-1', 470, 735),
  point('south-west-curve-2', 482, 747),
  point('south-west-curve-3', 493, 750),
  point('park-south', 668, 750, 'Path south of Ashok Mittal Park', 'Park'),
  point('east-junction', 875, 750),
  point('north-east-curve-1', 795, 229),
  point('north-east-curve-2', 807, 233),
  point('north-east-curve-3', 820, 246),
  point('north-east-curve-4', 868, 303),
  point('north-east-curve-5', 875, 316),
  point('design-path', 875, 635, 'Path by Design Department', 'Department'),
  point('food-path', 875, 928, 'Path by Food Court', 'Food'),
  point('south-east-curve-1', 875, 1188),
  point('south-east-curve-2', 870, 1198),
  point('south-east-curve-3', 860, 1204),
  point('hospital-path', 650, 1204, 'Path south of Uni Hospital', 'Hospital'),
  point('south-west-bend-1', 356, 1204),
  point('gh1-path', 176, 1204, 'Path by Girls Hostel 1', 'Hostel'),
  point('hostel-junction', 176, 1263),
  point('gh2-path', 55.25, 1263, 'Path by Girls Hostel 2', 'Hostel'),
  point('gh3-path', -163.5, 1263, 'Path by Girls Hostel 3', 'Hostel'),
  point('gh2-south-corner', 176, 1433),
  point('gh2-south-middle', 55.25, 1433),
  point('mall-midpoint', 55.25, 1564),
  point('south-west-bend-2', 347, 1208),
  point('south-west-bend-3', 346, 1217),
  point('multimedia-path', 346, 1360, 'Path west of Multi Media', 'Media'),
  point('map-edge', 346, 1447, 'North map edge', 'Walking path'),
  point('south-start', 346, 1475, 'Path south of Multimedia', 'Walking path'),
  point('bank-path', 346, 1600, 'Path by Bank Area (outside LPU)', 'Bank'),
  point('crossing-east', 346, 1694, 'Chowk crossing east', 'Walking path'),
  point('dsw-north-junction', 346, 1734),
  point('dsw-north-corner', 566, 1734),
  point('dsw-north', 566, 1750, 'Path near Student Welfare (north)', 'Student Welfare'),
  point('dsw-south-junction', 346, 1916),
  point('dsw-south-corner', 551, 1916),
  point('dsw-south', 551, 1900, 'Path near Student Welfare (south)', 'Student Welfare'),
  point('business-junction', 346, 2134),
  point('business-corner', 551, 2134),
  point('business-path', 551, 2105, 'Path near Mittal School of Business', 'School'),
  point('park-junction', 346, 2194),
  point('park-corner', 410, 2194),
  point('south-park', 410, 2208, 'Path near south park', 'Park'),
  point('parking-path', 346, 2400, 'Path by car parking', 'Parking'),
  point('south-edge', 346, 2644, 'South walking path edge', 'Walking path'),
  point('crossing-west', 151, 1694, 'Chowk crossing west', 'Walking path'),
  point('mall-corner', 151, 1564),
  point('mall-path', 100, 1564, 'Path by Uni Mall', 'Mall'),
  point('mall-edge', 0, 1564),
  point('building-path', 151, 1900, 'Path by Uni Polish', 'Walking path'),
  point('robo-corner', 151, 2179),
  point('robo-junction', 61, 2179),
  point('west-edge', 0, 2179),
  point('robo-path', 61, 2424, 'Path by Robo Park', 'Park'),
];

export const locations = nodes.filter(node => node.name);

const pairs = [
  ['student-entry', 'id-check'], ['id-check', 'north-junction'],
  ['north-junction', 'north-west-curve-1'], ['north-west-curve-1', 'north-west-curve-2'],
  ['north-west-curve-2', 'north-west-curve-3'], ['north-west-curve-3', 'west-straight'],
  ['west-straight', 'south-west-curve-1'], ['south-west-curve-1', 'south-west-curve-2'],
  ['south-west-curve-2', 'south-west-curve-3'], ['south-west-curve-3', 'park-south'],
  ['park-south', 'east-junction'],
  ['north-junction', 'north-east-curve-1'], ['north-east-curve-1', 'north-east-curve-2'],
  ['north-east-curve-2', 'north-east-curve-3'], ['north-east-curve-3', 'north-east-curve-4'],
  ['north-east-curve-4', 'north-east-curve-5'], ['north-east-curve-5', 'design-path'],
  ['design-path', 'east-junction'], ['east-junction', 'food-path'],
  ['food-path', 'south-east-curve-1'], ['south-east-curve-1', 'south-east-curve-2'],
  ['south-east-curve-2', 'south-east-curve-3'], ['south-east-curve-3', 'hospital-path'],
  ['hospital-path', 'south-west-bend-1'], ['south-west-bend-1', 'south-west-bend-2'],
  ['south-west-bend-1', 'gh1-path'], ['gh1-path', 'hostel-junction'],
  ['hostel-junction', 'gh2-path'], ['gh2-path', 'gh3-path'],
  ['hostel-junction', 'gh2-south-corner'], ['gh2-south-corner', 'gh2-south-middle'],
  ['gh2-south-middle', 'mall-midpoint'],
  ['south-west-bend-2', 'south-west-bend-3'], ['south-west-bend-3', 'multimedia-path'],
  ['multimedia-path', 'map-edge'], ['map-edge', 'south-start'],
  ['south-start', 'bank-path'], ['bank-path', 'crossing-east'], ['crossing-east', 'dsw-north-junction'],
  ['dsw-north-junction', 'dsw-north-corner'], ['dsw-north-corner', 'dsw-north'],
  ['dsw-north-junction', 'dsw-south-junction'], ['dsw-south-junction', 'dsw-south-corner'],
  ['dsw-south-corner', 'dsw-south'], ['dsw-south-junction', 'business-junction'],
  ['business-junction', 'business-corner'], ['business-corner', 'business-path'],
  ['business-junction', 'park-junction'], ['park-junction', 'park-corner'],
  ['park-corner', 'south-park'], ['park-junction', 'parking-path'],
  ['parking-path', 'south-edge'], ['crossing-east', 'crossing-west'],
  ['crossing-west', 'mall-corner'], ['mall-corner', 'mall-path'], ['mall-path', 'mall-midpoint'], ['mall-midpoint', 'mall-edge'],
  ['crossing-west', 'building-path'], ['building-path', 'robo-corner'],
  ['robo-corner', 'robo-junction'], ['robo-junction', 'west-edge'], ['robo-junction', 'robo-path'],
];
const byId = new Map(nodes.map(node => [node.id, node]));
export const connections = pairs.map(([from, to]) => {
  const a = byId.get(from);
  const b = byId.get(to);
  return { from, to, distance: Math.hypot((a.x - b.x) * width / 100, (a.y - b.y) * height / 100) };
});

// Landmarks are for orientation only: no route to their doors is asserted.
export const landmarks = [
  point('park', 670, 530, 'Ashok Mittal Park', 'Park'),
  point('design', 1000, 635, 'Design Department', 'Department'),
  point('food', 1000, 920, 'Food Court', 'Food'),
  point('hospital', 610, 970, 'Uni Hospital', 'Hospital'),
  point('hostel', 81.5, 1174, 'Girls Hostel 1', 'Hostel'),
  point('multimedia', 670, 1350, 'Multi Media', 'Media'),
  point('bank', 548, 1575, 'Bank area (outside LPU)', 'Bank'),
  point('uni-polish', -100, 1930, 'Uni Polish', 'Building'),
  point('gh2', 55.25, 1346, 'Girls Hostel 2', 'Hostel'),
  point('gh3', -163.5, 1346, 'Girls Hostel 3', 'Hostel'),
  point('mall', -100, 1665, 'Uni Mall', 'Mall'),
  point('robo', 10, 2380, 'Robo Park', 'Park'),
  point('dsw', 548, 1815, 'Division of Student Welfare', 'Department'),
  point('business', 548, 2010, 'Mittal School of Business', 'School'),
  point('south-park-landmark', 530, 2186, 'Park', 'Park'),
  point('parking', 610, 2400, 'Car Parking', 'Parking'),
  point('car-gate', 250, 45, 'Car main gate', 'Vehicle entry'),
];
export const mapImage = '/assets/maps/campus-map.svg';
