import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VolumeX, Volume2 } from 'lucide-react';

interface IntroSequenceProps {
  onSkip: () => void;
  onComplete: () => void;
}

// Panel definitions — staggered positions (as fractions of VW/VH, resolved at runtime)
const ERA_DEFS = [
  { src: '/Intro/egypt.png',  label: 'Ancient Egypt',   topFrac: 0.05, widthFrac: 0.48, heightFrac: 0.75, rotate: -3,   personRelX: 0.25, personRelY: 0.55 },
  { src: '/Intro/india.png',  label: 'Ancient India',   topFrac: 0.22, widthFrac: 0.42, heightFrac: 0.68, rotate: 2.5,  personRelX: 0.40, personRelY: 0.68 },
  { src: '/Intro/china.png',  label: 'Ancient China',   topFrac: 0.03, widthFrac: 0.46, heightFrac: 0.78, rotate: -2,   personRelX: 0.35, personRelY: 0.52 },
  { src: '/Intro/greek.png',  label: 'Ancient Greece',  topFrac: 0.18, widthFrac: 0.44, heightFrac: 0.70, rotate: 3,    personRelX: 0.50, personRelY: 0.70 },
  { src: '/Intro/Modern.png', label: 'The Present',     topFrac: 0.08, widthFrac: 0.50, heightFrac: 0.80, rotate: -1.5, personRelX: 0.50, personRelY: 0.45 },
];

// Gap between panels and leading void (in fraction of VW)
const PANEL_GAP_FRAC   = 0.35;
const LEAD_IN_FRAC     = 1.0;   // Egypt starts just off right edge → blank screen at open
const TRAIL_VOID_FRAC  = 0.3;
const PX_PER_MS        = 0.36;  // comfortable cruising speed

export function IntroSequence({ onSkip, onComplete }: IntroSequenceProps) {
  const [ready, setReady] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [activePulse, setActivePulse] = useState<number | null>(null);
  const [phase, setPhase] = useState<'scroll' | 'climax' | 'done'>('scroll');
  const [showCTA, setShowCTA] = useState(false);
  const [logoSnapping, setLogoSnapping] = useState(false);

  const stripRef       = useRef<HTMLDivElement>(null);
  const pathRef        = useRef<SVGPathElement>(null);
  const animFrameRef   = useRef<number>(0);
  const scrollXRef     = useRef(0);
  const phaseRef       = useRef<'scroll' | 'climax' | 'done'>('scroll');
  const pulsedRef      = useRef<Set<number>>(new Set());
  const audioRef       = useRef<HTMLAudioElement | null>(null);
  const isMutedRef     = useRef(true); // ref so rAF loop reads latest value without stale closure

  // Resolved layout (computed in useEffect once mounted)
  const layoutRef = useRef<{
    panels: Array<{ left: number; top: number; width: number; height: number; rotate: number; personX: number; personY: number; pulseAtScrollX: number }>;
    totalCanvas: number;
    climaxX: number;
    xCenterX: number;
    xCenterY: number;
  } | null>(null);

  const svgPathData = useRef<string>('');

  // ── Build layout once mounted ────────────────────────────────────────────
  useEffect(() => {
    const VW = window.innerWidth;
    const VH = window.innerHeight;

    let cursorX = VW * LEAD_IN_FRAC;
    const panels = ERA_DEFS.map((def) => {
      const w = VW * def.widthFrac;
      const h = VH * def.heightFrac;
      const top = VH * def.topFrac;
      const left = cursorX;
      cursorX += w + VW * PANEL_GAP_FRAC;
      return {
        left, top, width: w, height: h,
        rotate: def.rotate,
        personX: left + w * def.personRelX,
        personY: top  + h * def.personRelY,
      };
    });


    const lastPanel = panels[panels.length - 1];
    const lastImageExitsAt = lastPanel.left + lastPanel.width;
    const climaxX    = lastImageExitsAt + VW * TRAIL_VOID_FRAC;
    const totalCanvas = climaxX + VW * 1.1;
    const xCenterX   = climaxX + VW * 0.5;
    const xCenterY   = VH * 0.5;

    // startX = where the SVG path begins (canvas left edge)
    const startX = VW * 0.05;
    const startY = VH * 0.5;

    // Precompute the scroll-X at which the line tip reaches each person.
    const panelsWithPulse = panels.map(p => ({
      ...p,
      pulseAtScrollX: ((p.personX - startX) / (xCenterX - startX)) * climaxX,
    }));

    layoutRef.current = { panels: panelsWithPulse, totalCanvas, climaxX, xCenterX, xCenterY };

    // Build SVG path: start left → thread through all persons → trail to X center
    const pts = [
      { x: startX, y: startY },
      ...panels.map(p => ({ x: p.personX, y: p.personY })),
      { x: xCenterX - VW * 0.4, y: VH * 0.5 }, // thread approaches center
      { x: xCenterX,              y: xCenterY },  // thread arrives at X center
    ];


    const segs: string[] = [`M ${pts[0].x} ${pts[0].y}`];
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const dx = curr.x - prev.x;
      const cx1 = prev.x + dx * 0.35;
      const cy1 = prev.y + (Math.random() - 0.5) * VH * 0.25;
      const cx2 = prev.x + dx * 0.65;
      const cy2 = curr.y + (Math.random() - 0.5) * VH * 0.15;
      segs.push(`C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`);
    }
    svgPathData.current = segs.join(' ');

    setReady(true);
  }, []);

  // ── Initialize audio & skip timer ────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 1000);
    audioRef.current = new Audio('/chime.mp3');
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ── Main animation loop ──────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || phase !== 'scroll') return;

    const layout = layoutRef.current!;
    const VW = window.innerWidth;

    // Cache total path length once path is rendered
    let totalPathLength = 0;
    const initPathLength = () => {
      if (pathRef.current && totalPathLength === 0) {
        totalPathLength = pathRef.current.getTotalLength();
        pathRef.current.style.strokeDasharray  = `${totalPathLength}`;
        pathRef.current.style.strokeDashoffset = `${totalPathLength}`;
      }
    };

    let lastTimestamp = 0;

    const tick = (timestamp: number) => {
      if (phaseRef.current !== 'scroll') return;

      // Time-based delta so speed is identical at 60Hz, 120Hz, 144Hz
      if (lastTimestamp === 0) lastTimestamp = timestamp;
      const delta = Math.min(timestamp - lastTimestamp, 50); // cap delta to avoid jump after tab switch
      lastTimestamp = timestamp;

      scrollXRef.current += PX_PER_MS * delta;
      const sx = scrollXRef.current;

      // Translate strip
      if (stripRef.current) {
        stripRef.current.style.transform = `translateX(-${sx}px)`;
      }

      // Draw thread in sync with scroll progress
      initPathLength();
      if (pathRef.current && totalPathLength > 0) {
        const scrollable = layout.climaxX; // progress relative to climax point
        const progress = Math.min(sx / scrollable, 1);
        pathRef.current.style.strokeDashoffset = `${totalPathLength * (1 - progress)}`;
      }

      // Trigger pulse when the LINE TIP reaches each person (synced to draw progress)
      layout.panels.forEach((panel, i) => {
        if (!pulsedRef.current.has(i) && sx >= panel.pulseAtScrollX) {
          pulsedRef.current.add(i);
          setActivePulse(i);
          if (!isMutedRef.current && audioRef.current) {
            const c = audioRef.current.cloneNode() as HTMLAudioElement;
            c.volume = 0.35;
            c.play().catch(() => {});
          }
          setTimeout(() => setActivePulse(p => p === i ? null : p), 1400);
        }
      });

      // Climax trigger
      if (sx >= layout.climaxX) {
        phaseRef.current = 'climax';
        setPhase('climax');
        // X draws in ~0.8s. Show CTA right after.
        setTimeout(() => setShowCTA(true), 700);
        // Logo snaps at 2s. Call onComplete() immediately so hero starts loading.
        setTimeout(() => {
          setLogoSnapping(true);
          onComplete(); // hero fades in as logo snaps to corner
        }, 2200);
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [ready, phase]);

  const handleSkip = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    onSkip();
  }, [onSkip]);

  if (!ready) return <div className="fixed inset-0 z-[100]" style={{ background: '#000' }} />;

  const layout = layoutRef.current!;
  const VW = typeof window !== 'undefined' ? window.innerWidth  : 1440;
  const VH = typeof window !== 'undefined' ? window.innerHeight : 900;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" style={{ background: '#000' }}>

      {/* ── Scrolling canvas strip ───────────────────────────────────────── */}
      <div
        ref={stripRef}
        className="absolute top-0 left-0 will-change-transform"
        style={{ width: layout.totalCanvas, height: '100%' }}
      >


        {/* SVG Red Thread — inside strip, scrolls with it */}
        <svg
          className="absolute top-0 left-0 pointer-events-none z-10"
          style={{ width: layout.totalCanvas, height: '100%', overflow: 'visible' }}
          viewBox={`0 0 ${layout.totalCanvas} ${VH}`}
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="thread-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* No ghost track — only the drawn portion is visible */}
          {/* Sharp red thread */}
          <path
            ref={pathRef}
            d={svgPathData.current}
            stroke="#E62B1E"
            strokeWidth="2.5"
            fill="none"
            filter="url(#thread-glow)"
            strokeLinecap="round"
            style={{ strokeDasharray: '99999', strokeDashoffset: '99999' }}
          />
        </svg>

        {/* Staggered image panels */}
        {ERA_DEFS.map((era, i) => {
          const panel = layout.panels[i];
          return (
            <div
              key={era.src}
              className="absolute"
              style={{
                left:   panel.left,
                top:    panel.top,
                width:  panel.width,
                height: panel.height,
                transform: `rotate(${panel.rotate}deg)`,
              }}
            >
              {/* Image — no overflow:hidden so gradient can bleed outward */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={era.src}
                  alt={era.label}
                  className="w-full h-full object-cover object-center select-none"
                  draggable={false}
                  style={{ filter: 'brightness(0.82) contrast(1.05)' }}
                />
              </div>
              {/* Full-edge feather: 4 directional gradients that dissolve image into #000 */}
              <div className="absolute pointer-events-none" style={{
                inset: '-18px',
                background: `
                  linear-gradient(to right,  #000 0%, transparent 22%, transparent 78%, #000 100%),
                  linear-gradient(to bottom, #000 0%, transparent 22%, transparent 78%, #000 100%)
                `,
              }} />
              {/* Era label bottom */}
              <div className="absolute bottom-4 left-5 pointer-events-none">
                <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-light">{era.label}</p>
              </div>

              {/* Pulse dot at person position (in local panel coords) */}
              <AnimatePresence>
                {activePulse === i && (
                  <motion.div
                    key="pulse"
                    className="absolute pointer-events-none"
                    style={{
                      left:  `${era.personRelX * 100}%`,
                      top:   `${era.personRelY * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {[1, 1.8, 2.8].map((scale, ri) => (
                      <motion.div
                        key={ri}
                        className="absolute rounded-full border border-[#E62B1E]"
                        style={{ width: 32, height: 32, left: -16, top: -16 }}
                        initial={{ scale: 0.3, opacity: 0.9 }}
                        animate={{ scale, opacity: 0 }}
                        transition={{ duration: 1 + ri * 0.2, ease: 'easeOut', delay: ri * 0.15 }}
                      />
                    ))}
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E62B1E]"
                      style={{ marginLeft: -5, marginTop: -5, boxShadow: '0 0 14px 4px rgba(230,43,30,0.7)' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Void gradient — fades to black after last panel */}
        {(() => {
          const lastPanel = layout.panels[layout.panels.length - 1];
          const voidStart = lastPanel.left + lastPanel.width;
          return (
            <div
              className="absolute top-0 h-full pointer-events-none"
              style={{
                left: voidStart - 100,
                width: layout.totalCanvas - voidStart + 100,
                background: `linear-gradient(to right, transparent 0%, #000 12%, #000 100%)`,
              }}
            />
          );
        })()}
      </div>

      {/* ── Climax overlay (rendered fixed, not in strip) ────────────────── */}
      <AnimatePresence>
        {phase === 'climax' && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Darken the background further */}
            <motion.div
              className="absolute inset-0" style={{ background: '#000' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.96 }}
              transition={{ duration: 0.7 }}
            />

            {!logoSnapping && (
              <motion.div
                className="relative z-10 flex flex-col items-center gap-8"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              >
                {/* Glowing X */}
                <div className="relative">
                  {/* Outer diffuse glow */}
                  <div className="absolute inset-0 scale-150 blur-3xl opacity-40"
                    style={{ background: 'radial-gradient(circle, #E62B1E 0%, transparent 70%)' }}
                  />
                  <svg viewBox="0 0 200 200" className="w-32 h-32 md:w-48 md:h-48 relative z-10" overflow="visible">
                    <defs>
                      <filter id="xglow">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" /><feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <motion.line x1="15" y1="15" x2="185" y2="185"
                      stroke="#E62B1E" strokeWidth="20" strokeLinecap="round" filter="url(#xglow)"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                    />
                    <motion.line x1="185" y1="15" x2="15" y2="185"
                      stroke="#E62B1E" strokeWidth="20" strokeLinecap="round" filter="url(#xglow)"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.45, ease: 'easeOut', delay: 0.35 }}
                    />
                  </svg>
                </div>

                {/* CTA */}
                <AnimatePresence>
                  {showCTA && (
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                      <h1
                        className="text-6xl md:text-8xl font-bold text-white leading-none mb-4"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-0.02em' }}
                      >
                        TEDx <span style={{ color: '#E62B1E' }}>Legacy</span>
                      </h1>
                      <p className="text-base md:text-xl text-white/50 uppercase tracking-[0.25em] font-light">
                        Be a part of human history
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Snap logo to corner */}
            {logoSnapping && (
              <motion.div
                className="absolute z-50 flex items-center gap-2"
                initial={{ top: '50%', left: '50%', x: '-50%', y: '-50%', scale: 1.6, opacity: 1 }}
                animate={{ top: '2rem', left: '3rem', x: '0%', y: '0%', scale: 1 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="font-bold text-2xl md:text-3xl tracking-tighter" style={{ color: '#E62B1E' }}>TEDx</span>
                <motion.span
                  className="font-light text-xl md:text-2xl mt-0.5 text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55, duration: 0.4 }}
                >
                  CUSAT
                </motion.span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Skip & mute ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSkip && phase === 'scroll' && (
          <motion.div
            className="absolute bottom-8 right-8 z-[120] flex items-center gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={() => { setIsMuted(m => { isMutedRef.current = !m; return !m; }); }}
              className="text-white/30 hover:text-white/70 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={handleSkip}
              className="text-white/30 hover:text-white/70 text-xs font-medium tracking-widest uppercase transition-colors border border-white/10 hover:border-white/30 px-4 py-1.5 rounded-full"
            >
              Skip
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
