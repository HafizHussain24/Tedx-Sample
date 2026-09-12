import { SVGProps } from 'react';

// Common styling for all silhouettes
const commonStyle: SVGProps<SVGSVGElement> = {
  className: "w-full h-full max-w-[120px] max-h-[120px] md:max-w-[200px] md:max-h-[200px] opacity-20 text-accent stroke-current",
  viewBox: "0 0 100 100",
  fill: "none",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const EraIllustrations = {
  Egypt: () => (
    <svg {...commonStyle}>
      <path d="M10 90 L40 30 L70 90 Z" /> {/* Pyramid */}
      <path d="M50 90 L75 50 L100 90 Z" /> {/* Smaller Pyramid */}
      <circle cx="85" cy="70" r="5" /> {/* Stylized figure head */}
      <path d="M85 75 L85 90 M80 80 L90 80" /> {/* Figure body */}
    </svg>
  ),
  India: () => (
    <svg {...commonStyle}>
      <path d="M20 90 L20 70 C20 40 80 40 80 70 L80 90 Z" /> {/* Stupa */}
      <rect x="45" y="30" width="10" height="10" />
      <circle cx="80" cy="65" r="5" /> {/* Stylized figure head */}
      <path d="M80 70 L80 90 M75 80 L80 75" /> {/* Figure body */}
    </svg>
  ),
  China: () => (
    <svg {...commonStyle}>
      <path d="M50 20 L20 40 L80 40 Z" /> {/* Pagoda top */}
      <path d="M30 40 L30 60 M70 40 L70 60" />
      <path d="M10 60 L90 60 L70 80 L30 80 Z" /> {/* Pagoda mid */}
      <path d="M40 80 L40 90 M60 80 L60 90" />
      <circle cx="85" cy="70" r="4" /> {/* Figure */}
      <path d="M85 74 L85 90 M80 82 L90 82" />
    </svg>
  ),
  Greece: () => (
    <svg {...commonStyle}>
      <path d="M10 30 L90 30 L50 10 Z" /> {/* Parthenon roof */}
      <path d="M20 30 L20 90 M40 30 L40 90 M60 30 L60 90 M80 30 L80 90" /> {/* Columns */}
      <circle cx="50" cy="70" r="5" fill="currentColor" opacity="0.5"/> {/* Figure */}
      <path d="M50 75 L50 90 M45 80 L55 75" /> 
    </svg>
  ),
  Modern: () => (
    <svg {...commonStyle}>
      <rect x="10" y="40" width="20" height="50" /> {/* Skyscrapers */}
      <rect x="35" y="20" width="25" height="70" />
      <rect x="65" y="50" width="15" height="40" />
      <circle cx="90" cy="65" r="6" fill="currentColor" /> {/* Modern figure */}
      <path d="M90 71 L90 90 M82 80 L98 80" />
    </svg>
  )
};
