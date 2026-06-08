import {
  Injectable,
  signal,
} from '@angular/core';

declare const cv: any;

export interface Dart {

  id: string;

  tipX: number;
  tipY: number;

  confidence: number;

  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class DartDetectionService {

  readonly darts =
    signal<Dart[]>([]);

  readonly error =
    signal<string | null>(null);

  readonly detecting =
    signal(false);

  detectNewDarts(
    beforeFrame: ImageData,
    afterFrame: ImageData,
  ): Dart[] {

    if (
      !beforeFrame ||
      !afterFrame
    ) {
      return [];
    }

    let beforeMat: any;
    let afterMat: any;

    let beforeGray: any;
    let afterGray: any;

    let diff: any;
    let thresh: any;
    let contours: any;
    let hierarchy: any;

    try {

      this.detecting.set(true);

      beforeMat =
        this.imageDataToMat(
          beforeFrame
        );

      afterMat =
        this.imageDataToMat(
          afterFrame
        );

      beforeGray =
        new cv.Mat();

      afterGray =
        new cv.Mat();

      diff =
        new cv.Mat();

      thresh =
        new cv.Mat();

      contours =
        new cv.MatVector();

      hierarchy =
        new cv.Mat();

      cv.cvtColor(
        beforeMat,
        beforeGray,
        cv.COLOR_RGBA2GRAY
      );

      cv.cvtColor(
        afterMat,
        afterGray,
        cv.COLOR_RGBA2GRAY
      );

      cv.GaussianBlur(
        beforeGray,
        beforeGray,
        new cv.Size(5, 5),
        0
      );

      cv.GaussianBlur(
        afterGray,
        afterGray,
        new cv.Size(5, 5),
        0
      );

      cv.absdiff(
        beforeGray,
        afterGray,
        diff
      );

      cv.threshold(
        diff,
        thresh,
        25,
        255,
        cv.THRESH_BINARY
      );

      const kernel =
        cv.getStructuringElement(
          cv.MORPH_RECT,
          new cv.Size(3, 3)
        );

      cv.morphologyEx(
        thresh,
        thresh,
        cv.MORPH_CLOSE,
        kernel
      );

      kernel.delete();

      cv.findContours(
        thresh,
        contours,
        hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
      );

      const darts: Dart[] = [];

      for (
        let i = 0;
        i < contours.size();
        i++
      ) {

        const contour =
          contours.get(i);

        const area =
          cv.contourArea(
            contour
          );

        if (area < 100) {

          contour.delete();

          continue;
        }

        const rect =
          cv.boundingRect(
            contour
          );

        const aspectRatio =
          rect.width > rect.height
            ? rect.width /
            rect.height
            : rect.height /
            rect.width;

        if (aspectRatio < 2) {

          contour.delete();

          continue;
        }

        const dart =
          this.createDartFromContour(
            contour,
            area
          );

        if (dart) {
          darts.push(dart);
        }

        contour.delete();
      }

      this.darts.set(darts);

      return darts;

    } catch (error) {

      console.error(error);

      this.error.set(
        'Dart-Erkennung fehlgeschlagen'
      );

      return [];

    } finally {

      beforeMat?.delete?.();
      afterMat?.delete?.();

      beforeGray?.delete?.();
      afterGray?.delete?.();

      diff?.delete?.();
      thresh?.delete?.();

      contours?.delete?.();
      hierarchy?.delete?.();

      this.detecting.set(false);
    }
  }

  private imageDataToMat(
    imageData: ImageData
  ): any {

    const mat =
      new cv.Mat(
        imageData.height,
        imageData.width,
        cv.CV_8UC4
      );

    mat.data.set(
      imageData.data
    );

    return mat;
  }

  private createDartFromContour(
    contour: any,
    area: number
  ): Dart | null {

    const points =
      contour.data32S;

    if (
      !points ||
      points.length < 4
    ) {
      return null;
    }

    let tipX =
      points[0];

    let tipY =
      points[1];

    let minX =
      tipX;

    for (
      let i = 0;
      i < points.length;
      i += 2
    ) {

      const x =
        points[i];

      const y =
        points[i + 1];

      if (x < minX) {

        minX = x;

        tipX = x;
        tipY = y;
      }
    }

    const confidence =
      Math.min(
        1,
        area / 2000
      );

    return {

      id:
        crypto.randomUUID(),

      tipX,

      tipY,

      confidence,

      timestamp:
        Date.now(),
    };
  }

  clear(): void {

    this.darts.set([]);
  }
}
