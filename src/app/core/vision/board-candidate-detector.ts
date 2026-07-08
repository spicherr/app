import {
  Injectable, Inject, inject
} from '@angular/core';

import {
  BoardCandidate,
} from '../models/board-candidate.model';
import {DebugService} from '../services/debug';

declare const cv: any;

@Injectable({
  providedIn: 'root',
})
export class BoardCandidateDetector {
  private readonly debug =
    inject(
      DebugService
    );
  detect(
    gray: any,
    threshold: any,
    imageWidth: number,
    imageHeight: number,
    sensitivity: number,
  ): BoardCandidate[] {

    const candidates: BoardCandidate[] = [];

    candidates.push(
      ...this.detectCircles(
        gray,
        imageWidth,
        imageHeight,
        sensitivity
      )
    );

    candidates.push(
      ...this.detectContours(
        threshold
      )
    );

    return this.mergeCandidates(
      candidates
    );

  }

  private detectCircles(
    gray: any,
    imageWidth: number,
    imageHeight: number,
    sensitivity: number,
  ): BoardCandidate[] {

    const circles =
      new cv.Mat();

    const candidates:
      BoardCandidate[] = [];

    try {

      const param2 =
        Math.max(
          20,
          70 -
          sensitivity * 0.5
        );

      const minRadius =
        Math.floor(
          imageHeight * 0.15
        );

      const maxRadius =
        Math.floor(
          imageHeight * 0.48
        );

      cv.HoughCircles(

        gray,

        circles,

        cv.HOUGH_GRADIENT,

        1,

        100,

        120,

        param2,

        minRadius,

        maxRadius

      );

      const borderMargin =
        imageHeight * 0.05;

      for (
        let i = 0;
        i < circles.cols;
        i++
      ) {

        const centerX =
          circles.data32F[
          i * 3
            ];

        const centerY =
          circles.data32F[
          i * 3 + 1
            ];

        const radius =
          circles.data32F[
          i * 3 + 2
            ];

        //
        // Kreis vollständig im Bild?
        //
        if (
          centerX - radius < borderMargin ||
          centerX + radius > imageWidth - borderMargin ||
          centerY - radius < borderMargin ||
          centerY + radius > imageHeight - borderMargin
        ) {

          continue;

        }

        const radiusScore =
          Math.min(
            1,
            radius / maxRadius
          );

        const borderScore =
          1;

        candidates.push({

          centerX,

          centerY,

          radius,
          source: 'hough',
          confidence: radiusScore * borderScore,

        });

      }

      this.debug.log(
        'BoardCandidateDetector',
        'Hough-Kandidaten',
        candidates
      );

      return candidates;

    } finally {

      circles.delete();

    }

  }


  private detectContours(
    threshold: any,
  ): BoardCandidate[] {

    const contours =
      this.findContours(
        threshold
      );

    try {

      const candidates:
        BoardCandidate[] = [];

      for (
        let i = 0;
        i < contours.size();
        i++
      ) {

        const contour =
          contours.get(i);

        try {

          if (
            !this.isValidContour(
              contour
            )
          ) {

            continue;

          }

          candidates.push(
            this.createCandidate(
              contour
            )
          );

        } finally {

          contour.delete();

        }

      }

      return candidates;

    } finally {

      contours.delete();

    }

  }
  private findContours(
    threshold: any,
  ): any {

    const contours =
      new cv.MatVector();

    const hierarchy =
      new cv.Mat();

    cv.findContours(

      threshold,

      contours,

      hierarchy,

      cv.RETR_EXTERNAL,

      cv.CHAIN_APPROX_SIMPLE

    );

    hierarchy.delete();

    return contours;

  }
  private isValidContour(
    contour: any,
  ): boolean {

    const area =
      cv.contourArea(
        contour
      );

    if (
      area < 5000
    ) {

      return false;

    }

    const perimeter =
      cv.arcLength(
        contour,
        true
      );

    if (
      perimeter <= 0
    ) {

      return false;

    }

    return (
      this.calculateCircularity(
        area,
        perimeter
      ) >= 0.60
    );

  }
  private calculateCircularity(
    area: number,
    perimeter: number,
  ): number {

    return (

      4 *

      Math.PI *

      area /

      (
        perimeter *
        perimeter
      )

    );

  }
  private createCandidate(
    contour: any,
  ): BoardCandidate {

    const circle =
      cv.minEnclosingCircle(
        contour
      );

    const area =
      cv.contourArea(
        contour
      );

    const perimeter =
      cv.arcLength(
        contour,
        true
      );

    const confidence =
      Math.min(

        1,

        this.calculateCircularity(

          area,

          perimeter

        )

      );

    return {

      centerX:
      circle.center.x,

      centerY:
      circle.center.y,

      radius:
      circle.radius,

      source:
        'contour',

      confidence,

    };

  }
  private mergeCandidates(
    candidates: BoardCandidate[],
  ): BoardCandidate[] {

    const merged: BoardCandidate[] = [];

    const maxCenterDistance = 20;

    const maxRadiusDifference = 20;

    for (
      const candidate of candidates
      ) {

      const existing =
        merged.find(current => {

          const centerDistance =
            Math.hypot(

              current.centerX -
              candidate.centerX,

              current.centerY -
              candidate.centerY

            );

          const radiusDifference =
            Math.abs(

              current.radius -
              candidate.radius

            );

          return (

            centerDistance <=
            maxCenterDistance &&

            radiusDifference <=
            maxRadiusDifference

          );

        });

      if (!existing) {

        merged.push({

          centerX:
          candidate.centerX,

          centerY:
          candidate.centerY,

          radius:
          candidate.radius,

          source:
          candidate.source,

          confidence:
          candidate.confidence,

        });

        continue;

      }

      //
      // Mittelpunkt mitteln
      //
      existing.centerX =
        (
          existing.centerX +
          candidate.centerX
        ) / 2;

      existing.centerY =
        (
          existing.centerY +
          candidate.centerY
        ) / 2;

      //
      // Radius mitteln
      //
      existing.radius =
        (
          existing.radius +
          candidate.radius
        ) / 2;

      //
      // Beste Confidence übernehmen
      //
      existing.confidence =
        Math.max(

          existing.confidence,

          candidate.confidence

        );

      //
      // Kombination aus Hough und Contour
      // erhöht die Sicherheit
      //
      if (

        existing.source !==
        candidate.source

      ) {

        existing.confidence =
          Math.min(

            1,

            existing.confidence + 0.10

          );

        if (
          candidate.source ===
          'hough'
        ) {

          existing.source =
            'hough';

        }

      }

    }

    console.log(
      'Merged Candidates:',
      merged
    );

    return merged;

  }
}
