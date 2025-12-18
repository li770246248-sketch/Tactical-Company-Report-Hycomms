
export interface GroundingSource {
  title?: string;
  uri: string;
}

export type Language = 'zh' | 'en';

export interface IntelligenceReport {
  id: string;
  content: string;
  sources: GroundingSource[];
  companyName: string;
  timestamp: string;
  website?: string;
  logoUrl?: string;
  language: Language;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
