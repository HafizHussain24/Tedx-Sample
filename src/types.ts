export type Speaker = {
  id: string;
  name: string;
  epithet: string; // Used as the main role for modern speakers
  description: string;
  image: string; // URL for photo or SVG path/component for silhouette
  isHistorical: boolean;
};

export const historicalSpeakers: Speaker[] = [
  {
    id: "h1",
    name: "Imhotep",
    epithet: "The First Architect of Ideas",
    description: "Physician, architect, and adviser to a pharaoh, Imhotep designed the Step Pyramid of Saqqara — one of the world's earliest large-scale stone monuments. He is among the first individuals in recorded history credited by name with an original idea, rather than myth or royal decree.",
    image: "/Speakers/imhotep.png",
    isHistorical: true,
  },
  {
    id: "h2",
    name: "Aristotle",
    epithet: "The Master of Those Who Know",
    description: "Founder of formal logic and one of history's first systematic thinkers, Aristotle proposed that knowledge could be organized, taught, and questioned rather than simply inherited. His method of inquiry still underlies how ideas are tested and shared today.",
    image: "/Speakers/aristotle.png",
    isHistorical: true,
  },
  {
    id: "h3",
    name: "Chanakya",
    epithet: "The Architect of the State",
    description: "A strategist and philosopher behind the rise of the Mauryan Empire, Chanakya authored the *Arthashastra* — one of the earliest systematic works on economics, governance, and diplomacy, laying foundations for statecraft that endure across centuries.",
    image: "/Speakers/chanakya.png",
    isHistorical: true,
  },
  {
    id: "h4",
    name: "Confucius",
    epithet: "The Teacher of Ten Thousand Generations",
    description: "A philosopher who believed a good society begins with personal virtue and education, Confucius shaped ethical and social thought across East Asia for over two thousand years, teaching that ideas take root through character as much as argument.",
    image: "/Speakers/confucious.png",
    isHistorical: true,
  },
  {
    id: "h5",
    name: "Al-Khwarizmi",
    epithet: "The Father of Algorithms",
    description: "A mathematician of the Islamic Golden Age in Baghdad, Al-Khwarizmi formalized algebra and systematic problem-solving procedures. His work gave rise to the very concept of the algorithm — the direct ancestor of the logic powering today's ideas and technology.",
    image: "/Speakers/khwarizmi.png",
    isHistorical: true,
  }
];

export const modernSpeakers: Speaker[] = [
  {
    id: "m1",
    name: "Dr. Elena Rostova",
    epithet: "AI Researcher, CUSAT",
    description: "Pioneering the intersection of ethical AI and human cognitive modeling. She will explore how our historical biases shape the algorithms of tomorrow, and how we can build fairer systems.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
    isHistorical: false,
  },
  {
    id: "m2",
    name: "Marcus Thorne",
    epithet: "Climate Architect",
    description: "Designing self-sustaining urban ecosystems. Marcus challenges the traditional boundaries of architecture, proposing living buildings that actively heal their surrounding environments.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop",
    isHistorical: false,
  },
  {
    id: "m3",
    name: "Dr. Ananya Sharma",
    epithet: "Neurobiologist",
    description: "Unlocking the secrets of neuroplasticity. Her research demonstrates that the adult brain's capacity for fundamental rewiring is far greater than previously understood, offering new hope for neurological recovery.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop",
    isHistorical: false,
  }
];
