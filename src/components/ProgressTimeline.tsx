import { motion } from 'framer-motion';

interface ProgressTimelineProps {
  currentIndex: number;
  total: number;
}

export function ProgressTimeline({ currentIndex, total }: ProgressTimelineProps) {
  return (
    <div className="w-full max-w-md mx-auto mt-8 flex items-center gap-2">
      <span className="text-xs font-mono text-gray-500 opacity-60">01</span>
      <div className="flex-1 h-1 bg-charcoal rounded-full overflow-hidden flex relative">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex-1 h-full border-r border-bg last:border-0 relative">
            {i <= currentIndex && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0 bg-accent shadow-[0_0_8px_rgba(230,43,30,0.6)]"
              />
            )}
          </div>
        ))}
      </div>
      <span className="text-xs font-mono text-gray-500 opacity-60">0{total}</span>
    </div>
  );
}
