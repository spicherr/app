export interface BoardCandidate {

  centerX: number;

  centerY: number;

  radius: number;

  source: 'hough'|'contour';

  confidence: number;
}
export interface ScoredBoardCandidate
  extends BoardCandidate {

  score: number;

}
