import {
  Injectable,
} from '@angular/core';

import {
  DetectedBoard,
} from '../models/dart-board.model';

declare const cv: any;

@Injectable({
  providedIn: 'root',
})
export class BoardDetector {

  detect(
    imageData: ImageData,
    sensitivity: number,
  ): DetectedBoard | null {

    if (
      !imageData ||
      imageData.width === 0 ||
      imageData.height === 0
    ) {

      return null;

    }

    let src: any;
    let gray: any;
    let circles: any;

    try {

      src =
        cv.matFromImageData(
          imageData
        );

      gray =
        new cv.Mat();

      circles =
        new cv.Mat();

      cv.cvtColor(
        src,
        gray,
        cv.COLOR_RGBA2GRAY
      );

      cv.GaussianBlur(
        gray,
        gray,
        new cv.Size(9, 9),
        2,
        2,
        cv.BORDER_DEFAULT
      );

      const param2 =
        Math.max(
          20,
          70 -
          sensitivity * 0.5
        );

      const minRadius =
        Math.floor(
          imageData.height * 0.15
        );

      const maxRadius =
        Math.floor(
          imageData.height * 0.48
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

      if (
        circles.cols === 0
      ) {

        return null;

      }

      const board =
        this.findBestCircle(
          circles,
          imageData.width,
          imageData.height,
          maxRadius
        );

      return board;

    } finally {

      src?.delete();

      gray?.delete();

      circles?.delete();

    }

  }

  private findBestCircle(
    circles: any,
    imageWidth: number,
    imageHeight: number,
    maxRadius: number,
  ): DetectedBoard {

    let bestIndex = 0;

    let bestScore = -1;

    const centerX =
      imageWidth / 2;

    const centerY =
      imageHeight / 2;

    for (
      let i = 0;
      i < circles.cols;
      i++
    ) {

      const x =
        circles.data32F[
        i * 3
          ];

      const y =
        circles.data32F[
        i * 3 + 1
          ];

      const radius =
        circles.data32F[
        i * 3 + 2
          ];

      const distance =
        Math.hypot(
          x - centerX,
          y - centerY
        );

      const radiusScore =
        radius /
        maxRadius;

      const centerScore =
        1 -
        distance /
        Math.max(
          imageWidth,
          imageHeight
        );

      const score =
        radiusScore * 0.7 +
        centerScore * 0.3;

      if (
        score >
        bestScore
      ) {

        bestScore =
          score;

        bestIndex =
          i;

      }

    }

    const offset =
      bestIndex * 3;

    const radius =
      circles.data32F[
      offset + 2
        ];

    return {

      centerX:
        circles.data32F[offset],

      centerY:
        circles.data32F[
        offset + 1
          ],

      outerRadius: radius,

      confidence:
      bestScore,

    };

  }

}
