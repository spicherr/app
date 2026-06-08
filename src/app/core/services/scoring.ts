import {
  Injectable,
} from '@angular/core';

import {
  DartBoard,
} from './board-detection';

import {
  Dart,
} from './dart-detection';

export interface DartScore {

  segment: number;

  multiplier: number;

  score: number;
}

@Injectable({
  providedIn: 'root',
})
export class ScoringService {

  /**
   * Offizielle Segmentreihenfolge
   * beginnend bei 20 (12 Uhr)
   */
  private readonly segments = [
    20,
    1,
    18,
    4,
    13,
    6,
    10,
    15,
    2,
    17,
    3,
    19,
    7,
    16,
    8,
    11,
    14,
    9,
    12,
    5,
  ];

  /**
   * Offizielle PDC-Geometrie
   * relativ zum Boardradius
   *
   * Normiert auf den äußeren Double-Ring.
   */
  private readonly geometry = {

    outerBull: 15.9 / 170,

    innerBull: 6.35 / 170,

    tripleInner: 99 / 170,

    tripleOuter: 107 / 170,

    doubleInner: 162 / 170,

    doubleOuter: 170 / 170,
  };

  calculateScore(
    board: DartBoard,
    dart: Dart
  ): DartScore {

    const dx =
      dart.tipX -
      board.centerX;

    const dy =
      dart.tipY -
      board.centerY;

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    const normalizedRadius =
      distance /
      board.radius;

    /**
     * Außerhalb Board
     */
    if (
      normalizedRadius >
      this.geometry.doubleOuter
    ) {

      return {
        segment: 0,
        multiplier: 0,
        score: 0,
      };
    }

    /**
     * Bull
     */
    if (
      normalizedRadius <=
      this.geometry.innerBull
    ) {

      return {
        segment: 25,
        multiplier: 2,
        score: 50,
      };
    }

    /**
     * Outer Bull
     */
    if (
      normalizedRadius <=
      this.geometry.outerBull
    ) {

      return {
        segment: 25,
        multiplier: 1,
        score: 25,
      };
    }

    const segment =
      this.calculateSegment(
        dx,
        dy
      );

    /**
     * Triple
     */
    if (
      normalizedRadius >=
      this.geometry.tripleInner &&
      normalizedRadius <=
      this.geometry.tripleOuter
    ) {

      return {
        segment,
        multiplier: 3,
        score:
          segment * 3,
      };
    }

    /**
     * Double
     */
    if (
      normalizedRadius >=
      this.geometry.doubleInner &&
      normalizedRadius <=
      this.geometry.doubleOuter
    ) {

      return {
        segment,
        multiplier: 2,
        score:
          segment * 2,
      };
    }

    /**
     * Single
     */
    return {
      segment,
      multiplier: 1,
      score: segment,
    };
  }

  private calculateSegment(
    dx: number,
    dy: number
  ): number {

    /**
     * atan2:
     *
     * 0° = rechts
     *
     * Wir benötigen:
     *
     * 0° = 20 (oben)
     */

    let angle =
      Math.atan2(
        dy,
        dx
      ) *
      180 /
      Math.PI;

    angle += 90;

    if (angle < 0) {
      angle += 360;
    }

    if (angle >= 360) {
      angle -= 360;
    }

    /**
     * 20 Segmente
     * je 18°
     */

    const index =
      Math.floor(
        (angle + 9) / 18
      ) % 20;

    return this.segments[
      index
      ];
  }
}
