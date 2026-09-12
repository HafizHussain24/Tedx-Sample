import { motion } from 'framer-motion';

interface TabSwitcherProps {
  activeTab: 'modern' | 'historical';
  onTabChange: (tab: 'modern' | 'historical') => void;
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="flex justify-center w-full z-20 relative pt-8 pb-4">
      <div className="flex gap-4 md:gap-12 relative p-1">
        <button
          onClick={() => onTabChange('modern')}
          className={`relative px-4 py-2 flex flex-col items-center transition-all duration-300 ${
            activeTab === 'modern' ? 'text-fg opacity-100' : 'text-gray-400 opacity-60 hover:opacity-80'
          }`}
        >
          <span className="text-lg md:text-xl font-bold tracking-wide">The Voice of Today</span>
          {activeTab === 'modern' && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent"
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>

        <button
          onClick={() => onTabChange('historical')}
          className={`relative px-4 py-2 flex flex-col items-center transition-all duration-300 ${
            activeTab === 'historical' ? 'text-fg opacity-100 glow-accent' : 'text-gray-500 opacity-50 hover:opacity-70'
          }`}
        >
          <span className="text-lg md:text-xl font-serif italic tracking-wider">Echoes of Gone Centuries</span>
          <span className="text-xs uppercase tracking-widest mt-1 opacity-75">Inspiration from history</span>
          {activeTab === 'historical' && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent shadow-[0_0_10px_rgba(230,43,30,0.8)]"
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      </div>
    </div>
  );
}
