export interface DetectedBoard {

  centerX: number;

  centerY: number;

  outerRadius: number;

  confidence: number;
}
export interface CalibratedBoard
  extends DetectedBoard {

  angle: number;

  bullRadius: number;

  tripleRadius: number;

  doubleRadius: number;
}
