export interface IDPreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  aspectRatio: number; // width / height
  description: string;
  region: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface ComplianceResult {
  isCentered: boolean;
  lightingQuality: 'good' | 'fair' | 'poor';
  backgroundCheck: boolean;
  eyesVisible: boolean;
  feedback: string[];
  score: number;
}