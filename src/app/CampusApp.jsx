'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { locations, nodes, connections, landmarks, mapImage, mapWidth, mapHeight } from '../data/campus';
import { findRoute } from '../utils/routes';
import { getDirections } from '../utils/directions';
import './App.css';

export default function App() {
  const [query, setQuery] = useState('');
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [shown, setShown] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(0.1);
  const previousMinZoom = useRef(null);
  const baseWidth = 850;
  const maxZoom = 3;
  const [step, setStep] = useState(0);
  const mapRef = useRef(null);
  const dragRef = useRef(null);
  const zoomCenterRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const initializedMap = useRef(false);
  const frameMap = () => {
    const map = mapRef.current;
    if (map && !initializedMap.current) {
      map.scrollLeft = Math.max(0, map.scrollWidth * 0.65 - map.clientWidth / 2);
      initializedMap.current = true;
    }
  };
  useLayoutEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const updateMinimum = () => {
      const fit = Math.min(Math.max(1, map.clientWidth - 24) / baseWidth, Math.max(1, map.clientHeight - 24) / (baseWidth * mapHeight / mapWidth));
      if (!Number.isFinite(fit) || fit <= 0) return;
      const oldMinimum = previousMinZoom.current;
      previousMinZoom.current = fit;
      setMinZoom(fit);
      setZoom(current => oldMinimum !== null && Math.abs(current - oldMinimum) < 0.001 ? fit : Math.max(fit, current));
    };
    updateMinimum();
    const observer = new ResizeObserver(updateMinimum);
    observer.observe(map);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const map = mapRef.current;
    const center = zoomCenterRef.current;
    const content = map?.querySelector('.map-content');
    if (map && center && content) {
      map.scrollLeft = content.offsetLeft + center.x * content.offsetWidth - map.clientWidth / 2;
      map.scrollTop = content.offsetTop + center.y * content.offsetHeight - map.clientHeight / 2;
      zoomCenterRef.current = null;
    }
  }, [zoom]);
  const changeZoom = nextZoom => {
    const map = mapRef.current;
    const content = map?.querySelector('.map-content');
    if (map && content) zoomCenterRef.current = {
      x: Math.min(1, Math.max(0, (map.scrollLeft + map.clientWidth / 2 - content.offsetLeft) / content.offsetWidth)),
      y: Math.min(1, Math.max(0, (map.scrollTop + map.clientHeight / 2 - content.offsetTop) / content.offsetHeight)),
    };
    setZoom(Math.min(maxZoom, Math.max(minZoom, nextZoom)));
  };
  const beginDrag = event => {
    if (event.button !== 0 || event.target.closest('button')) return;
    const map = event.currentTarget;
    dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: map.scrollLeft, top: map.scrollTop, moved: false };
    map.setPointerCapture(event.pointerId);
  };
  const moveDrag = event => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    if (!drag.moved) { drag.moved = true; setDragging(true); }
    event.currentTarget.scrollLeft = drag.left - dx;
    event.currentTarget.scrollTop = drag.top - dy;
  };
  const endDrag = event => {
    if (dragRef.current?.id !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const panKeys = event => {
    const delta = { ArrowLeft: [-80, 0], ArrowRight: [80, 0], ArrowUp: [0, -80], ArrowDown: [0, 80] }[event.key];
    if (!delta || event.target !== event.currentTarget) return;
    event.preventDefault();
    event.currentTarget.scrollBy({ left: delta[0], top: delta[1] });
  };
  const results = useMemo(() => locations.filter(p => `${p.name} ${p.category || ''}`.toLowerCase().includes(query.toLowerCase().trim())), [query]);
  const landmarkResults = useMemo(() => query.trim() ? landmarks.filter(p => `${p.name} ${p.category || ''}`.toLowerCase().includes(query.toLowerCase().trim())) : [], [query]);
  const route = shown && start && destination ? findRoute(nodes, connections, start, destination) : null;
  const points = route?.path.map(id => nodes.find(p => p.id === id)).filter(Boolean) || [];
  const steps = route ? getDirections(points) : [];
  const stepPoint = steps[step] ? points[steps[step].pointIndex] : null;
  const choose = (setter, value) => { setter(value); setShown(false); setStep(0); };
  const showRoute = (event) => { event.preventDefault(); setStep(0); setShown(true); };
  return <div className="app">
    <header><a className="brand" href="#home"><span className="brand-icon">↗</span><span>WHICH BLOCK <b>IS 34?</b><small>YOUR CAMPUS COMPANION</small></span></a><nav><a href="#explore">Map</a><a href="#directions">Directions</a><a href="#about">About</a></nav><span className="campus-tag">LPU CAMPUS GUIDE</span></header>
    <main id="home"><section className="workspace" id="explore"><div className="section-head"><div><span className="eyebrow">LPU CAMPUS · WALKING DIRECTIONS</span><h2>Where would you like to go?</h2><p>Choose two points on the walking path to plan your route.</p></div><span className="status"><span className="dot"/> REFERENCE MAP</span></div>
      <div className="grid"><aside className="panel"><form className="directions-form" id="directions" onSubmit={showRoute}><div className="panel-title"><div><span className="number">↗</span><h3>Walking directions</h3></div><span>🚶</span></div>
        <label htmlFor="start">WHERE ARE YOU STARTING?</label><select id="start" required value={start} onChange={e => choose(setStart, e.target.value)}><option value="">Choose a starting point</option>{locations.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <button type="button" className="swap" onClick={() => { setStart(destination); setDestination(start); setShown(false); setStep(0); }} aria-label="Swap start and destination">⇅ Swap</button>
        <label htmlFor="destination">WHERE DO YOU WANT TO GO?</label><select id="destination" required value={destination} onChange={e => choose(setDestination, e.target.value)}><option value="">Choose a destination</option>{locations.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <button className="show-route" type="submit">Show walking route <span>→</span></button><p className="route-note">Routes follow the mapped footpaths. Stops near buildings are not confirmed entrances.</p>
      </form>
      {shown && <section className="steps" aria-live="polite"><h3>Your route</h3>{!route ? <p>No walking path is shown between these points.</p> : <><p className="route-note">Planned directions · north is up on the map</p><ol>{steps.map((instruction, i) => <li key={i} className={i === step ? 'current-step' : ''}><button type="button" onClick={() => setStep(i)} aria-current={i === step ? 'step' : undefined}><span>{i + 1}</span>{typeof instruction === 'string' ? instruction : instruction.text}</button></li>)}</ol><div className="step-controls"><button type="button" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>Previous</button><button type="button" onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step >= steps.length - 1}>Next step →</button></div><p className="route-note">Advance steps manually; this is not live GPS tracking.</p></>}</section>}
      <div className="live-note"><strong>⌖ Live location</strong><p>Not available yet. The map needs matching GPS reference points before your position can be shown accurately.</p></div>
      <div className="explore-list"><div className="panel-title"><div><span className="number">⌕</span><h3>Explore places</h3></div></div><label htmlFor="search">SEARCH THIS MAP</label><div className="search"><span aria-hidden="true">⌕</span><input id="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a place" /></div><div className="results" aria-live="polite">{results.map(p => <button type="button" className="result" key={p.id} onClick={() => { choose(setDestination, p.id); document.getElementById('directions')?.scrollIntoView({ behavior: 'smooth' }); }}><span><strong>{p.name}</strong><small>Set as destination · {p.category}</small></span><span>↗</span></button>)}{landmarkResults.map(p => <div className="result landmark-result" key={p.id}><span><strong>{p.name}</strong><small>Landmark only · entrance not mapped</small></span></div>)}{!results.length && !landmarkResults.length && <p className="no-results">No matching places on this map.</p>}</div></div></aside>
      <div className="map-panel"><div className="map-top"><div><span className="eyebrow">2D CAMPUS MAP</span><h3>{route ? 'Your walking route' : 'Explore the map'}</h3></div><div className="zoom"><button onClick={() => changeZoom(zoom / 1.25)} disabled={zoom <= minZoom + 0.001} aria-label="Zoom out">−</button><button onClick={() => changeZoom(minZoom)} disabled={zoom <= minZoom + 0.001} className="fit-map" aria-label="Fit entire map">Fit</button><button onClick={() => changeZoom(zoom * 1.25)} disabled={zoom >= maxZoom} aria-label="Zoom in">+</button></div></div><div className="map-area"><div className={`map-scroll ${dragging ? 'is-dragging' : ''}`} ref={mapRef} role="region" tabIndex={0} aria-label="Campus map. Drag to move, or use arrow keys when focused. Use zoom controls to change scale." onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onKeyDown={panKeys}><div className="map-stage" style={{width: `max(100%, ${baseWidth * zoom}px)`, height: `max(100%, ${baseWidth * zoom * mapHeight / mapWidth}px)`}}><div className="map-content" style={{width: `${baseWidth * zoom}px`}}><img draggable={false} onLoad={frameMap} src={mapImage} alt="2D interpretation of the supplied campus reference; paved paths indicate walking routes"/><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} /></svg>{stepPoint && <span className="step-marker" style={{left:`${stepPoint.x}%`,top:`${stepPoint.y}%`}} title={`Step ${step + 1}`} aria-label={`Selected step ${step + 1}`}>{step + 1}</span>}{locations.map(p => <button key={p.id} className={`marker ${p.id === start ? 'start-marker' : ''} ${p.id === destination ? 'end-marker' : ''}`} style={{left:`${p.x}%`,top:`${p.y}%`}} title={p.name} aria-label={`Set ${p.name} as destination`} onClick={() => choose(setDestination, p.id)}>●</button>)}</div></div></div></div><div className="map-footer"><span>PAVED PATH: WALKING · BLUE: PLANNED ROUTE</span><span>DRAG TO MOVE · USE + / − TO ZOOM</span></div></div></div></section>
      <section className="about" id="about"><div><span className="eyebrow">A MORE CONFIDENT FIRST STEP</span><h2>Find your way, <em>one step at a time.</em></h2></div><p>This map covers only the supplied reference area. Directions are based on the drawn footpaths; building entrances, live position and the rest of campus are not yet mapped.</p></section></main><footer><a className="brand" href="#home">WHICH BLOCK <b>IS 34?</b></a><span>MADE FOR THE JOURNEY AHEAD.</span><a href="#home">BACK TO TOP ↑</a></footer></div>
}
