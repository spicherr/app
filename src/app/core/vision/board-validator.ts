import {
  Injectable,
} from '@angular/core';

import {
  BoardCandidate,
} from '../models/board-candidate.model';

import {
  DetectedBoard,
} from '../models/dart-board.model';

@Injectable({
  providedIn: 'root',
})
export class BoardValidator {

  validate(
    candidates: BoardCandidate[],
    imageWidth: number,
    imageHeight: number,
  ): DetectedBoard | null {

    if (
      candidates.length === 0
    ) {

      return null;

    }

    const imageCenterX =
      imageWidth / 2;

    const imageCenterY =
      imageHeight / 2;

    let bestCandidate:
      BoardCandidate | null =
      null;

    let bestScore =
      Number.NEGATIVE_INFINITY;

    const expectedRadius =
      imageHeight * 0.28;

    for (
      const candidate of candidates
      ) {

      const centerDistance =
        Math.hypot(
          candidate.centerX - imageCenterX,
          candidate.centerY - imageCenterY
        );

      const centerScore =
        1 -
        Math.min(
          1,
          centerDistance /
          Math.max(
            imageWidth,
            imageHeight
          )
        );

      const radiusError =
        Math.abs(
          candidate.radius -
          expectedRadius
        );

      const radiusScore =
        1 -
        Math.min(
          1,
          radiusError /
          expectedRadius
        );

      const score =
        radiusScore * 0.6 +
        centerScore * 0.4;

      console.log({

        candidate,

        radiusScore,

        centerScore,

        score,

      });

      if (
        score >
        bestScore
      ) {

        bestScore =
          score;

        bestCandidate =
          candidate;

      }

    }

    if (
      !bestCandidate
    ) {

      return null;

    }

    return {

      centerX:
      bestCandidate.centerX,

      centerY:
      bestCandidate.centerY,

      outerRadius:
      bestCandidate.radius,

      confidence:
      bestScore,

    };

  }

}
