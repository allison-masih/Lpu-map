# Which Block Is 34?

A responsive LPU campus guide built with Next.js App Router, React, JavaScript and plain CSS.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Run `npm run build` for a production build, `npm start` to serve that build, and `npm run lint` to check the source.

## Campus map and routes

The 2D map in `public/assets/maps/campus-map.svg` and walking graph in `src/data/campus.js` are based on the supplied north and south sketches. The paths from the red lines are rendered as paved footpaths; vehicle roads are not automatically walkable. The sketches are schematic and not to scale. Stops near buildings are points on the paths, not confirmed entrances. There is no real-world distance, walking-time estimate or live GPS positioning; accurate mapping and verification are still needed.

The graph uses relative image coordinates and weights, not metres. Search includes mapped path points and visual-only landmarks. Run `npm test` for route calculation checks.
