import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroSection } from './components/HeroSection';
import { IntroSequence } from './components/IntroSequence';

function App() {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [isResolved, setIsResolved] = useState<boolean>(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setShowIntro(false);
      setIsResolved(true);
    }
  }, []);

  const handleSkipIntro = () => {
    setShowIntro(false);
    setIsResolved(true);
  };

  const handleIntroComplete = () => {
    // Mount hero immediately — it fades in as the intro's logo snaps to corner
    setIsResolved(true);
    // Give logo-snap animation (0.85s) time to finish before unmounting intro overlay
    setTimeout(() => setShowIntro(false), 1000);
  };

  return (
    <div
      className="min-h-screen text-fg overflow-hidden relative selection:bg-accent selection:text-white"
      style={{ background: '#000' }}
    >
      {/* HeroSection mounts the moment the intro calls onComplete, fades in beneath */}
      <AnimatePresence>
        {isResolved && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full h-full"
          >
            <HeroSection />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro overlay — when it unmounts, hero is already visible underneath */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            className="fixed inset-0 z-[100]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <IntroSequence
              onSkip={handleSkipIntro}
              onComplete={handleIntroComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
