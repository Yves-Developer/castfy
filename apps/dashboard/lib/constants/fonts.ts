export interface FontFamily {
  availableWeights: string[];
  category:
    | "system"
    | "sans-serif"
    | "serif"
    | "display"
    | "handwriting"
    | "monospace";
  cssVariable?: string; // CSS variable name for Next.js loaded fonts
  description?: string; // Short description for UI
  fallback: string;
  id: string;
  name: string;
}

export const fontFamilies: FontFamily[] = [
  // ============ PREMIUM FONTS (Local) ============
  {
    id: "sf-pro-display",
    name: "SF Pro Display",
    category: "sans-serif",
    fallback:
      '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    availableWeights: [
      "100",
      "200",
      "300",
      "normal",
      "500",
      "600",
      "bold",
      "800",
      "900",
    ],
    description: "Apple's premium font",
  },

  // ============ SYSTEM FONTS ============
  {
    id: "system",
    name: "System Default",
    category: "system",
    fallback:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    availableWeights: ["normal", "bold"],
    description: "Native system font",
  },
  {
    id: "arial",
    name: "Arial",
    category: "system",
    fallback: "Arial, Helvetica, sans-serif",
    availableWeights: ["normal", "bold"],
    description: "Classic web-safe font",
  },

  // ============ MODERN SANS-SERIF ============
  {
    id: "inter",
    name: "Inter",
    category: "sans-serif",
    cssVariable: "--font-inter",
    fallback: "Inter, system-ui, sans-serif",
    availableWeights: [
      "100",
      "200",
      "300",
      "normal",
      "500",
      "600",
      "bold",
      "800",
      "900",
    ],
    description: "Modern UI favorite",
  },
  {
    id: "geist",
    name: "Geist",
    category: "sans-serif",
    cssVariable: "--font-geist-sans",
    fallback: "Geist, system-ui, sans-serif",
    availableWeights: ["normal", "500", "600", "bold"],
    description: "Vercel's modern typeface",
  },
  {
    id: "poppins",
    name: "Poppins",
    category: "sans-serif",
    cssVariable: "--font-poppins",
    fallback: "Poppins, sans-serif",
    availableWeights: [
      "100",
      "200",
      "300",
      "normal",
      "500",
      "600",
      "bold",
      "800",
      "900",
    ],
    description: "Geometric & friendly",
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    category: "sans-serif",
    cssVariable: "--font-space-grotesk",
    fallback: "Space Grotesk, sans-serif",
    availableWeights: ["300", "normal", "500", "600", "bold"],
    description: "Tech & startup aesthetic",
  },
  {
    id: "outfit",
    name: "Outfit",
    category: "sans-serif",
    cssVariable: "--font-outfit",
    fallback: "Outfit, sans-serif",
    availableWeights: [
      "100",
      "200",
      "300",
      "normal",
      "500",
      "600",
      "bold",
      "800",
      "900",
    ],
    description: "Modern & approachable",
  },
  {
    id: "plus-jakarta-sans",
    name: "Plus Jakarta Sans",
    category: "sans-serif",
    cssVariable: "--font-plus-jakarta-sans",
    fallback: "Plus Jakarta Sans, sans-serif",
    availableWeights: ["200", "300", "normal", "500", "600", "bold", "800"],
    description: "Clean & professional",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    category: "sans-serif",
    cssVariable: "--font-dm-sans",
    fallback: "DM Sans, sans-serif",
    availableWeights: [
      "100",
      "200",
      "300",
      "normal",
      "500",
      "600",
      "bold",
      "800",
      "900",
    ],
    description: "Geometric & readable",
  },
  {
    id: "sora",
    name: "Sora",
    category: "sans-serif",
    cssVariable: "--font-sora",
    fallback: "Sora, sans-serif",
    availableWeights: [
      "100",
      "200",
      "300",
      "normal",
      "500",
      "600",
      "bold",
      "800",
    ],
    description: "Futuristic geometric",
  },
  {
    id: "manrope",
    name: "Manrope",
    category: "sans-serif",
    cssVariable: "--font-manrope",
    fallback: "Manrope, sans-serif",
    availableWeights: ["200", "300", "normal", "500", "600", "bold", "800"],
    description: "Modern & versatile",
  },
  {
    id: "raleway",
    name: "Raleway",
    category: "sans-serif",
    cssVariable: "--font-raleway",
    fallback: "Raleway, sans-serif",
    availableWeights: [
      "100",
      "200",
      "300",
      "normal",
      "500",
      "600",
      "bold",
      "800",
      "900",
    ],
    description: "Elegant sans-serif",
  },
  {
    id: "montserrat",
    name: "Montserrat",
    category: "sans-serif",
    cssVariable: "--font-montserrat",
    fallback: "Montserrat, sans-serif",
    availableWeights: [
      "100",
      "200",
      "300",
      "normal",
      "500",
      "600",
      "bold",
      "800",
      "900",
    ],
    description: "Urban & modern",
  },
  {
    id: "lexend",
    name: "Lexend",
    category: "sans-serif",
    cssVariable: "--font-lexend",
    fallback: "Lexend, sans-serif",
    availableWeights: [
      "100",
      "200",
      "300",
      "normal",
      "500",
      "600",
      "bold",
      "800",
      "900",
    ],
    description: "Bold geometric, great readability",
  },
  {
    id: "work-sans",
    name: "Work Sans",
    category: "sans-serif",
    cssVariable: "--font-work-sans",
    fallback: "Work Sans, sans-serif",
    availableWeights: [
      "100",
      "200",
      "300",
      "normal",
      "500",
      "600",
      "bold",
      "800",
      "900",
    ],
    description: "Clean & optimized for screens",
  },
  {
    id: "urbanist",
    name: "Urbanist",
    category: "sans-serif",
    cssVariable: "--font-urbanist",
    fallback: "Urbanist, sans-serif",
    availableWeights: [
      "100",
      "200",
      "300",
      "normal",
      "500",
      "600",
      "bold",
      "800",
      "900",
    ],
    description: "Modern geometric sans",
  },
  {
    id: "albert-sans",
    name: "Albert Sans",
    category: "sans-serif",
    cssVariable: "--font-albert-sans",
    fallback: "Albert Sans, sans-serif",
    availableWeights: [
      "100",
      "200",
      "300",
      "normal",
      "500",
      "600",
      "bold",
      "800",
      "900",
    ],
    description: "Geometric grotesk",
  },

  // ============ DISPLAY / CONDENSED ============
  {
    id: "oswald",
    name: "Oswald",
    category: "display",
    cssVariable: "--font-oswald",
    fallback: "Oswald, Impact, sans-serif",
    availableWeights: ["200", "300", "normal", "500", "600", "bold"],
    description: "Bold condensed",
  },
  {
    id: "bebas-neue",
    name: "Bebas Neue",
    category: "display",
    cssVariable: "--font-bebas-neue",
    fallback: "Bebas Neue, Impact, sans-serif",
    availableWeights: ["normal"],
    description: "Impact headlines",
  },
  {
    id: "righteous",
    name: "Righteous",
    category: "display",
    cssVariable: "--font-righteous",
    fallback: "Righteous, cursive",
    availableWeights: ["normal"],
    description: "Retro-modern display",
  },

  // ============ SERIF ============
  {
    id: "playfair-display",
    name: "Playfair Display",
    category: "serif",
    cssVariable: "--font-playfair-display",
    fallback: "Playfair Display, Georgia, serif",
    availableWeights: ["normal", "500", "600", "bold", "800", "900"],
    description: "Elegant display serif",
  },
  {
    id: "lora",
    name: "Lora",
    category: "serif",
    cssVariable: "--font-lora",
    fallback: "Lora, Georgia, serif",
    availableWeights: ["normal", "500", "600", "bold"],
    description: "Contemporary serif",
  },
  {
    id: "libre-baskerville",
    name: "Libre Baskerville",
    category: "serif",
    cssVariable: "--font-libre-baskerville",
    fallback: "Libre Baskerville, Georgia, serif",
    availableWeights: ["normal", "bold"],
    description: "Classic elegance",
  },
  {
    id: "georgia",
    name: "Georgia",
    category: "serif",
    fallback: "Georgia, Times, serif",
    availableWeights: ["normal", "bold"],
    description: "Classic web serif",
  },

  // ============ HANDWRITING / SCRIPT ============
  {
    id: "caveat",
    name: "Caveat",
    category: "handwriting",
    cssVariable: "--font-caveat",
    fallback: "Caveat, cursive",
    availableWeights: ["normal", "500", "600", "bold"],
    description: "Casual handwriting",
  },
  {
    id: "pacifico",
    name: "Pacifico",
    category: "handwriting",
    cssVariable: "--font-pacifico",
    fallback: "Pacifico, cursive",
    availableWeights: ["normal"],
    description: "Retro brush script",
  },
  {
    id: "dancing-script",
    name: "Dancing Script",
    category: "handwriting",
    cssVariable: "--font-dancing-script",
    fallback: "Dancing Script, cursive",
    availableWeights: ["normal", "500", "600", "bold"],
    description: "Elegant script",
  },

  // ============ MONOSPACE ============
  {
    id: "geist-mono",
    name: "Geist Mono",
    category: "monospace",
    cssVariable: "--font-geist-mono",
    fallback: "Geist Mono, monospace",
    availableWeights: ["normal", "500", "600", "bold"],
    description: "Modern code font",
  },
  {
    id: "jetbrains-mono",
    name: "JetBrains Mono",
    category: "monospace",
    cssVariable: "--font-jetbrains-mono",
    fallback: "JetBrains Mono, monospace",
    availableWeights: [
      "100",
      "200",
      "300",
      "normal",
      "500",
      "600",
      "bold",
      "800",
    ],
    description: "Developer favorite",
  },
  {
    id: "fira-code",
    name: "Fira Code",
    category: "monospace",
    cssVariable: "--font-fira-code",
    fallback: "Fira Code, monospace",
    availableWeights: ["300", "normal", "500", "600", "bold"],
    description: "Code with ligatures",
  },
  {
    id: "courier",
    name: "Courier New",
    category: "monospace",
    fallback: "Courier New, Courier, monospace",
    availableWeights: ["normal", "bold"],
    description: "Classic typewriter",
  },
];

// Group fonts by category for UI display
export const fontCategories = {
  "sans-serif": "Modern Sans-Serif",
  display: "Display & Headlines",
  serif: "Elegant Serif",
  handwriting: "Handwriting & Script",
  monospace: "Monospace & Code",
  system: "System Fonts",
} as const;

export const getFontFamily = (id: string): FontFamily | undefined =>
  fontFamilies.find((font) => font.id === id);

export const getFontCSS = (fontId: string): string => {
  const font = getFontFamily(fontId);
  if (!font) {
    return fontFamilies[0].fallback;
  }

  // If font has a CSS variable (Next.js loaded font), use it
  if (font.cssVariable) {
    return `var(${font.cssVariable}), ${font.fallback}`;
  }

  return font.fallback;
};

export const getAvailableFontWeights = (fontId: string): string[] => {
  const font = getFontFamily(fontId);
  if (!font) {
    return ["normal", "bold"];
  }

  return font.availableWeights;
};

export const getFontsByCategory = (
  category: FontFamily["category"]
): FontFamily[] => fontFamilies.filter((font) => font.category === category);
