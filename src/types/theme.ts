export interface ThemeColors {
  themeColor: string;
  textColor: string;
  titleColor: string;
  helpDeskColor: string;
  background: string;
  iconColor: string;
  bubbleBackground?: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  category: string;
  colors: ThemeColors;
}

export interface ColorDescription {
  name: string;
  description: string;
  affects: string[];
} 