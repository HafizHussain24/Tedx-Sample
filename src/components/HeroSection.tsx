import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { modernSpeakers, historicalSpeakers } from '../types';
import type { Speaker } from '../types';

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-14 h-16 md:h-18"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}>
      {/* Logo */}
      <div className="flex items-center gap-1.5 select-none">
        <span className="font-bold text-xl md:text-2xl tracking-tighter" style={{ color: '#E62B1E' }}>TEDx</span>
        <span className="font-light text-lg md:text-xl text-white mt-px">CUSAT</span>
      </div>

      {/* Normal Navbar links */}
      <nav className="hidden md:flex items-center gap-8">
        <a href="#" className="text-sm font-medium tracking-widest uppercase text-white hover:text-white/80 transition-colors">Home</a>
        <a href="#" className="text-sm font-medium tracking-widest uppercase text-white/40 hover:text-white/70 transition-colors">About</a>
        <a href="#" className="text-sm font-medium tracking-widest uppercase text-white/40 hover:text-white/70 transition-colors">Schedule</a>
        <a href="#" className="text-sm font-medium tracking-widest uppercase text-white/40 hover:text-white/70 transition-colors">Contact</a>
      </nav>

      {/* CTA */}
      <button
        className="text-xs font-bold tracking-widest uppercase px-5 py-2.5 transition-all duration-300 hover:opacity-90 active:scale-95"
        style={{ background: '#E62B1E', color: '#fff', letterSpacing: '0.1em' }}
      >
        Register
      </button>
    </header>
  );
}

// ── Historical silhouette visual ──────────────────────────────────────────────
function HistoricalVisual({ speaker }: { speaker: Speaker }) {
  return (
    <div className="absolute inset-0 flex items-end justify-end">
      {/* The figure itself — full height, right-aligned, bleeds to edge */}
      <div className="relative h-[88vh] w-auto flex items-end justify-end pr-0"
        style={{ maxWidth: '52vw' }}>
        <div className="relative h-full w-full flex items-center justify-end">
          {/* Left fade so figure blends into text */}
          <div className="absolute inset-y-0 left-0 w-2/5 z-20 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #000 0%, transparent 100%)' }} />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 z-20 pointer-events-none"
            style={{ background: 'linear-gradient(to top, #000 0%, transparent 100%)' }} />
          <img
            src={speaker.image}
            alt={speaker.name}
            className="h-full w-full object-contain object-bottom"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

// ── Modern photography visual ─────────────────────────────────────────────────
function ModernVisual({ speaker }: { speaker: Speaker }) {
  return (
    <div className="absolute inset-0 flex items-end justify-end">
      <div className="relative h-[90vh] flex items-end" style={{ maxWidth: '48vw', width: '48vw' }}>
        {/* Red tint overlay to match historical */}
        <div className="absolute inset-0 mix-blend-color pointer-events-none z-10"
          style={{ background: 'rgba(230,43,30,0.12)' }} />
        {/* Left blend */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #000 0%, transparent 100%)' }} />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #000 0%, transparent 100%)' }} />
        <img
          src={speaker.image}
          alt={speaker.name}
          className="w-full h-full object-cover object-top"
          style={{ filter: 'grayscale(100%) contrast(1.2) brightness(0.9)' }}
          draggable={false}
        />
      </div>
    </div>
  );
}

// ── Main HeroSection ──────────────────────────────────────────────────────────
export function HeroSection() {
  const [activeTab, setActiveTab] = useState<'modern' | 'historical'>('modern');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const speakers = activeTab === 'modern' ? modernSpeakers : historicalSpeakers;
  const current  = speakers[currentIndex];

  const handleTabChange = (tab: 'modern' | 'historical') => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setCurrentIndex(0);
    setDirection(1);
  };

  const paginate = (dir: number) => {
    let next = currentIndex + dir;
    if (next < 0) next = speakers.length - 1;
    if (next >= speakers.length) next = 0;
    setDirection(dir);
    setCurrentIndex(next);
  };

  // Content slide variants — from right when going forward, from left when going back
  const textVariants = {
    enter:  (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  const imageVariants = {
    enter:  (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: '#000' }}>
      <Navbar />

      {/* ── Full-bleed visual panel (right side) ─────────────────────── */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={`visual-${activeTab}-${currentIndex}`}
          custom={direction}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-0"
        >
          {current.isHistorical
            ? <HistoricalVisual speaker={current} />
            : <ModernVisual    speaker={current} />
          }
        </motion.div>
      </AnimatePresence>

      {/* Right-side global gradient so text area stays readable */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #000 0%, #000 30%, rgba(0,0,0,0.55) 55%, transparent 100%)' }}
      />

      {/* Left-side ambient red glow behind the text */}
      <div className="absolute inset-y-0 left-0 w-[55vw] z-10 pointer-events-none mix-blend-screen"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 35% 50%, rgba(230,43,30,0.12) 0%, transparent 70%)' }}
      />

      {/* ── Text panel (left side, layered above gradient) ───────────── */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center pl-8 md:pl-14 pr-[48vw] pt-16">
        
        {/* Tab switcher */}
        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={() => handleTabChange('modern')}
            className={`text-xs font-bold tracking-[0.25em] uppercase transition-all duration-300 pb-1 border-b-2 ${activeTab === 'modern' ? 'text-[#E62B1E] border-[#E62B1E]' : 'text-white/40 border-transparent hover:text-white/70'}`}
          >
            The Voice of Today
          </button>
          <button
            onClick={() => handleTabChange('historical')}
            className={`text-xs font-bold tracking-[0.25em] uppercase transition-all duration-300 pb-1 border-b-2 ${activeTab === 'historical' ? 'text-[#E62B1E] border-[#E62B1E]' : 'text-white/40 border-transparent hover:text-white/70'}`}
          >
            The Echoes of Past
          </button>
        </div>

        {/* Fixed height container for dynamic text so arrows don't move */}
        <div className="relative h-[380px] flex flex-col justify-start">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={`text-${activeTab}-${currentIndex}`}
              custom={direction}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex flex-col"
            >
              {/* Speaker name — large, bold, impactful */}
              <h1
                className="font-bold leading-none mb-4 text-white"
                style={{
                  fontFamily: current.isHistorical ? "'Playfair Display', Georgia, serif" : "'Inter', system-ui, sans-serif",
                  fontSize: 'clamp(3rem, 6.5vw, 6rem)',
                  letterSpacing: '-0.02em',
                }}
              >
                {current.name}
              </h1>

              {/* Epithet / role */}
              <p className="font-medium mb-6 tracking-wide"
                style={{ color: '#E62B1E', fontSize: 'clamp(0.9rem, 1.6vw, 1.25rem)' }}>
                {current.epithet}
              </p>

              {/* Horizontal rule */}
              <div className="w-16 h-px mb-6" style={{ background: 'rgba(255,255,255,0.15)' }} />

              {/* Description */}
              <p className="text-white/55 leading-relaxed max-w-md"
                style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1rem)' }}>
                {current.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress + navigation (fixed position below text) */}
        <div className="flex items-center gap-6 mt-8">
          {/* Prev / Next */}
          <button
            onClick={() => paginate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-white/15 hover:border-[#E62B1E] text-white/50 hover:text-white transition-all duration-200 hover:shadow-[0_0_14px_rgba(230,43,30,0.4)]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-white/15 hover:border-[#E62B1E] text-white/50 hover:text-white transition-all duration-200 hover:shadow-[0_0_14px_rgba(230,43,30,0.4)]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {speakers.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                className="transition-all duration-300"
                style={{
                  width:  i === currentIndex ? 24 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === currentIndex ? '#E62B1E' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>

          {/* Counter */}
          <span className="text-white/30 text-xs font-mono ml-auto">
            {String(currentIndex + 1).padStart(2, '0')} / {String(speakers.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-8 md:px-14 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-white/20 text-[10px] uppercase tracking-[0.2em]">TEDxCUSAT 2026</p>
        <p className="text-white/20 text-[10px] uppercase tracking-[0.2em]">CUSAT, Kochi</p>
      </div>
    </div>
  );
}
