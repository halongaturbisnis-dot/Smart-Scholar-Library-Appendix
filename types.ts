
export enum AppMode {
  SUMMARY = 'SUMMARY',
  SLIDE_MAKER = 'SLIDE_MAKER',
}

export type AppLanguage = 'ID' | 'EN';

export interface SummaryResult {
  markdownText: string;
  visualData?: VisualData; // Now optional/loaded later
  language: AppLanguage;
}

export enum VisualType {
  PROCESS = 'PROCESS',
  CHART = 'CHART',
  NONE = 'NONE'
}

export interface VisualData {
  type: VisualType;
  title: string;
  // For Process/Flowchart
  steps?: { step: number; title: string; description: string }[];
  // For Charts (Recharts)
  chartData?: { name: string; value: number }[];
  chartLabel?: string;
}

export interface Slide {
  id: number;
  title: string;
  bullets: string[];
  footer?: string;
  speakerNotes: string;
  layout: 'title' | 'content' | 'split';
}

export interface SlideDeck {
  themeColor: string;
  fontStyle: string;
  slides: Slide[];
}

export interface SlideRequestConfig {
  topic: string; // Or file content
  customPrompt: string;
  themePreference: string;
}

export interface PdfConfig {
  fontStyle: 'serif' | 'sans';
  themeColor: string;
  density: 'comfortable' | 'compact';
  includeVisual: boolean;
}
