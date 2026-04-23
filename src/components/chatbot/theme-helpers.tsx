import { Preset, ThemeColors } from '@/types/theme';

// Theme categories with human-readable labels
export const THEME_CATEGORIES = {
  general: "General Purpose",
  industry: "Industry Specific",
  mood: "Psychological Mood",
  accessibility: "Accessibility-Focused"
};

export const COLOR_PRESETS: Record<string, ThemeColors> = {
  // General Purpose Themes
  classic: {
    themeColor: '#6366F1',  // Indigo (primary)
    textColor: '#4B5563',   // Gray-600 (body text)
    titleColor: '#1F2937',  // Gray-800 (headings)
    helpDeskColor: '#F3F4F6', // Gray-100 (knowledgebase)
    background: '#FFFFFF',  // White (background)
    iconColor: '#6366F1',   // Indigo (icons)
    bubbleBackground: '#F9FAFB' // Gray-50 (bot bubble background)
  },
  modern: {
    themeColor: '#0EA5E9',  // Sky-500 (primary)
    textColor: '#64748B',   // Slate-500 (body text)
    titleColor: '#0F172A',  // Slate-900 (headings)
    helpDeskColor: '#F0F9FF', // Sky-50 (knowledgebase)
    background: '#FFFFFF',  // White (background)
    iconColor: '#0EA5E9'    // Sky-500 (icons)
  },
  minimal: {
    themeColor: '#171717',  // Neutral-900 (primary)
    textColor: '#525252',   // Neutral-600 (body text)
    titleColor: '#171717',  // Neutral-900 (headings)
    helpDeskColor: '#F5F5F5', // Neutral-100 (knowledgebase)
    background: '#FFFFFF',  // White (background)
    iconColor: '#171717'    // Neutral-900 (icons)
  },
  
  // Industry Specific Themes
  healthcare: {
    themeColor: '#22C55E',  // Green-500 (primary - calming, health-associated)
    textColor: '#374151',   // Gray-700 (body text - good readability)
    titleColor: '#0F766E',  // Teal-700 (headings - professional, medical)
    helpDeskColor: '#ECFDF5', // Green-50 (knowledgebase - soothing, fresh)
    background: '#FFFFFF',  // White (background - clean, clinical)
    iconColor: '#22C55E'    // Green-500 (icons - consistent with primary)
  },
  finance: {
    themeColor: '#0C4A6E',  // Sky-900 (primary - trustworthy, stable)
    textColor: '#475569',   // Slate-600 (body text - professional)
    titleColor: '#0F172A',  // Slate-900 (headings - authoritative)
    helpDeskColor: '#F1F5F9', // Slate-100 (knowledgebase - clean, subtle)
    background: '#FFFFFF',  // White (background - clean)
    iconColor: '#0369A1'    // Sky-700 (icons - professional but approachable)
  },
  ecommerce: {
    themeColor: '#EC4899',  // Pink-500 (primary - engaging, commercial)
    textColor: '#4B5563',   // Gray-600 (body text - readable)
    titleColor: '#9D174D',  // Pink-900 (headings - emphasis, eye-catching)
    helpDeskColor: '#FDF2F8', // Pink-50 (knowledgebase - subtle product showcase)
    background: '#FFFFFF',  // White (background - product focus)
    iconColor: '#DB2777'    // Pink-600 (icons - shopable, exciting)
  },
  technology: {
    themeColor: '#8B5CF6',  // Violet-500 (primary - innovative, tech-forward)
    textColor: '#6B7280',   // Gray-500 (body text - modern)
    titleColor: '#4C1D95',  // Violet-900 (headings - deep tech)
    helpDeskColor: '#EEF2FF', // Indigo-50 (knowledgebase - clean, futuristic)
    background: '#FFFFFF',  // White (background)
    iconColor: '#8B5CF6'    // Violet-500 (icons - tech-focused)
  },
  education: {
    themeColor: '#F59E0B',  // Amber-500 (primary - energetic, learning)
    textColor: '#4B5563',   // Gray-600 (body text - readable) 
    titleColor: '#92400E',  // Amber-800 (headings - educational, warm)
    helpDeskColor: '#FFFBEB', // Amber-50 (knowledgebase - light learning space)
    background: '#FFFFFF',  // White (background)
    iconColor: '#D97706'    // Amber-600 (icons - warm, friendly)
  },
  
  // Psychological Mood Themes
  calm: {
    themeColor: '#0891B2',  // Cyan-600 (primary - serene, tranquil)
    textColor: '#4B5563',   // Gray-600 (body text)
    titleColor: '#164E63',  // Cyan-900 (headings - depth without aggression)
    helpDeskColor: '#ECFEFF', // Cyan-50 (knowledgebase - airy, peaceful)
    background: '#F8FAFC',  // Slate-50 (background - soft white, less harsh)
    iconColor: '#06B6D4'    // Cyan-500 (icons - peaceful but noticeable)
  },
  energetic: {
    themeColor: '#F97316',  // Orange-500 (primary - vibrant, energizing)
    textColor: '#4B5563',   // Gray-600 (body text)
    titleColor: '#7C2D12',  // Orange-900 (headings - rich, attention-grabbing)
    helpDeskColor: '#FFF7ED', // Orange-50 (knowledgebase - warm, inviting)
    background: '#FFFFFF',  // White (background)
    iconColor: '#FB923C'    // Orange-400 (icons - bright, active)
  },
  trustworthy: {
    themeColor: '#1D4ED8',  // Blue-700 (primary - trust, reliability) 
    textColor: '#4B5563',   // Gray-600 (body text)
    titleColor: '#1E3A8A',  // Blue-900 (headings - authoritative, solid)
    helpDeskColor: '#EFF6FF', // Blue-50 (knowledgebase - clean, reliable)
    background: '#FFFFFF',  // White (background)
    iconColor: '#3B82F6'    // Blue-500 (icons - approachable trust)
  },
  luxury: {
    themeColor: '#4338CA',  // Indigo-700 (primary - rich, premium)
    textColor: '#6B7280',   // Gray-500 (body text - elegant)
    titleColor: '#312E81',  // Indigo-900 (headings - premium, exclusive)
    helpDeskColor: '#E0E7FF', // Indigo-100 (knowledgebase - subtle luxury)
    background: '#FFFFFF',  // White (background)
    iconColor: '#A78BFA'    // Violet-400 (icons - sophisticated, premium)
  },
  
  // Accessibility-Focused Themes
  highContrast: {
    themeColor: '#000000',  // Black (primary - maximum contrast)
    textColor: '#000000',   // Black (body text - high readability)
    titleColor: '#000000',  // Black (headings - clear hierarchy)
    helpDeskColor: '#F9FAFB', // Gray-50 (knowledgebase - subtle contrast)
    background: '#FFFFFF',  // White (background - clean contrast)
    iconColor: '#000000'    // Black (icons - clear visibility)
  },
  lowVision: {
    themeColor: '#1E40AF',  // Blue-800 (primary - visible to most vision types)
    textColor: '#111827',   // Gray-900 (body text - high contrast for readability)
    titleColor: '#000000',  // Black (headings - maximum readability)
    helpDeskColor: '#EFF6FF', // Blue-50 (knowledgebase - soft distinction)
    background: '#FFFFFF',  // White (background)
    iconColor: '#2563EB'    // Blue-600 (icons - good visibility)
  },
  dark: {
    themeColor: '#6366F1',  // Indigo-500 (primary - standout against dark)
    textColor: '#E5E7EB',   // Gray-200 (body text - readable on dark)
    titleColor: '#F9FAFB',  // Gray-50 (headings - clear hierarchy)
    helpDeskColor: '#1F2937', // Gray-800 (knowledgebase - dark but distinct)
    background: '#111827',  // Gray-900 (background - reduced eye strain)
    iconColor: '#818CF8'    // Indigo-400 (icons - visible but not harsh)
  },
  deuteranopia: {
    themeColor: '#0284C7',  // Sky-600 (primary - visible with red-green colorblindness)
    textColor: '#1F2937',   // Gray-800 (body text - strong contrast)
    titleColor: '#111827',  // Gray-900 (headings)
    helpDeskColor: '#F0F9FF', // Sky-50 (knowledgebase - distinguishable)
    background: '#FFFFFF',  // White (background)
    iconColor: '#0284C7'    // Sky-600 (icons - consistent)
  }
};

export const COLOR_DESCRIPTIONS = {
  themeColor: {
    name: 'Primary Accent Color',
    description: 'The main brand color used for interactive elements and emphasis',
    affects: [
      'Button backgrounds',
      'Selected tab indicator',
      'User message bubbles',
      'Active states',
      'Links and CTAs'
    ]
  },
  background: {
    name: 'Window Background',
    description: 'The background color of the entire chat interface',
    affects: [
      'Main chat window background',
      'Message input area',
      'Overall chatbot frame'
    ]
  },
  bubbleBackground: {
    name: 'Bot Bubble Background',
    description: 'The background color of the AI assistant message bubbles',
    affects: [
      'Bot message bubbles',
      'Assistant responses',
      'System messages'
    ]
  },
  textColor: {
    name: 'Body Text Color',
    description: 'Used for regular paragraph text throughout the chatbot',
    affects: [
      'Chat message content',
      'Description text',
      'Secondary information',
      'Help text and instructions'
    ]
  },
  titleColor: {
    name: 'Heading Text Color',
    description: 'Used for titles, headings, and important emphasized text',
    affects: [
      'Section headings',
      'Chatbot name',
      'Question titles',
      'Navigation labels'
    ]
  },
  helpDeskColor: {
    name: 'Knowledge Base Color',
    description: 'Background color for help/FAQ sections',
    affects: [
      'FAQ accordion background',
      'Knowledge base sections',
      'Help area highlights'
    ]
  },
  iconColor: {
    name: 'Bot Icon Color',
    description: 'Primary color for bot avatar and related icons',
    affects: [
      'Chatbot avatar accent',
      'Navigation icons',
      'Status indicators'
    ]
  }
};

// Theme descriptions for better UX
export const THEME_DESCRIPTIONS: Record<string, {
  name: string;
  description: string;
  category: string;
}> = {
  // General Purpose
  classic: {
    name: "Classic",
    description: "Timeless design with a balanced color palette suitable for most businesses",
    category: "general"
  },
  modern: {
    name: "Modern",
    description: "Clean, contemporary design with a fresh blue accent",
    category: "general"
  },
  minimal: {
    name: "Minimal",
    description: "Sleek monochromatic design with focus on content",
    category: "general"
  },
  
  // Industry Specific
  healthcare: {
    name: "Healthcare",
    description: "Calming green palette inspiring trust and wellness",
    category: "industry"
  },
  finance: {
    name: "Finance",
    description: "Professional deep blue tones conveying security and stability",
    category: "industry"
  },
  ecommerce: {
    name: "E-commerce",
    description: "Engaging pink palette optimized for product showcasing",
    category: "industry"
  },
  technology: {
    name: "Technology",
    description: "Forward-thinking purple shades for tech-focused brands",
    category: "industry"
  },
  education: {
    name: "Education",
    description: "Warm amber tones creating a friendly learning environment",
    category: "industry"
  },
  
  // Psychological Mood
  calm: {
    name: "Calm",
    description: "Serene blue-green palette reducing anxiety during interactions",
    category: "mood"
  },
  energetic: {
    name: "Energetic",
    description: "Vibrant orange accents creating excitement and activity",
    category: "mood"
  },
  trustworthy: {
    name: "Trustworthy",
    description: "Reliable blue tones building confidence in your support",
    category: "mood"
  },
  luxury: {
    name: "Luxury",
    description: "Rich purple and gold tones elevating premium experiences",
    category: "mood"
  },
  
  // Accessibility
  highContrast: {
    name: "High Contrast",
    description: "Maximum black/white contrast for optimal readability",
    category: "accessibility"
  },
  lowVision: {
    name: "Low Vision",
    description: "Enhanced text contrast and larger touch targets",
    category: "accessibility"
  },
  dark: {
    name: "Dark Mode",
    description: "Reduced brightness for low light environments and eye comfort",
    category: "accessibility"
  },
  deuteranopia: {
    name: "Color-Blind Friendly",
    description: "Designed for users with color vision deficiency",
    category: "accessibility"
  }
};

/**
 * Returns a preset theme by name with fallback to classic
 */
export function getPresetByName(name: string) {
  return COLOR_PRESETS[name] || COLOR_PRESETS.classic;
}

/**
 * Returns a list of all available presets
 */
export function getAllPresets(): Preset[] {
  return Object.entries(COLOR_PRESETS).map(([key, colors]) => ({
    id: key,
    name: THEME_DESCRIPTIONS[key]?.name || key.charAt(0).toUpperCase() + key.slice(1),
    description: THEME_DESCRIPTIONS[key]?.description || '',
    category: THEME_DESCRIPTIONS[key]?.category || 'general',
    colors
  }));
}

/**
 * Returns presets filtered by category
 */
export function getPresetsByCategory(category: string): Preset[] {
  return getAllPresets().filter(preset => 
    THEME_DESCRIPTIONS[preset.id]?.category === category
  );
}

/**
 * Gets a contrast-friendly text color based on background
 * Used for ensuring text remains readable on colored backgrounds
 */
export function getContrastTextColor(backgroundColor: string): string {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance - standard formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
} 