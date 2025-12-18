
export interface GroundingSource {
  title?: string;
  uri: string;
}

export interface IntelligenceReport {
  content: string;
  sources: GroundingSource[];
  companyName: string;
  timestamp: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
