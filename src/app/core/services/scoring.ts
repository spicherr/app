import {
  Injectable,
} from '@angular/core';

import {
  DartBoard,
} from './board-detection';

import {
  Dart,
} from './dart-detection';
import {
  PDC_BOARD,
  PDC_SEGMENTS,
} from '../constants/pdc-board';
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
      PDC_BOARD.doubleOuter
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
      PDC_BOARD.innerBull
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
      PDC_BOARD.outerBull
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
      PDC_BOARD.tripleInner &&
      normalizedRadius <=
      PDC_BOARD.tripleOuter
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
      PDC_BOARD.doubleInner &&
      normalizedRadius <=
      PDC_BOARD.doubleOuter
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
    console.log({
      angle,
      index,
      segment:
        PDC_SEGMENTS[index],
    });
    return PDC_SEGMENTS[
      index
      ];
  }
}
