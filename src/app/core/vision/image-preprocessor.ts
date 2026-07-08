import {
  Injectable,
} from '@angular/core';

declare const cv: any;

@Injectable({
  providedIn: 'root',
})
export class ImagePreprocessor {

  preprocess(
    imageData: ImageData,
  ): any {

    const src =
      cv.matFromImageData(
        imageData
      );

    try {

      const gray =
        this.toGray(
          src
        );

      const normalized =
        this.normalizeContrast(
          gray
        );

      gray.delete();

      const blurred =
        this.blur(
          normalized
        );

      normalized.delete();

      return blurred;

    } finally {

      src.delete();

    }

  }

  private toGray(
    src: any,
  ): any {

    const gray =
      new cv.Mat();

    cv.cvtColor(
      src,
      gray,
      cv.COLOR_RGBA2GRAY
    );

    return gray;

  }

  private normalizeContrast(
    gray: any,
  ): any {

    const result =
      new cv.Mat();

    //
    // Histogramm normalisieren
    //
    cv.equalizeHist(
      gray,
      result
    );

    return result;

  }

  private blur(
    gray: any,
  ): any {

    const result =
      new cv.Mat();

    cv.GaussianBlur(

      gray,

      result,

      new cv.Size(
        9,
        9
      ),

      2,

      2,

      cv.BORDER_DEFAULT

    );

    return result;

  }
  private adaptiveThreshold(
    gray: any,
  ): any {

    const result =
      new cv.Mat();

    cv.adaptiveThreshold(

      gray,

      result,

      255,

      cv.ADAPTIVE_THRESH_GAUSSIAN_C,

      cv.THRESH_BINARY,

      21,

      5

    );

    return result;

  }
  preprocessForContours(
    imageData: ImageData,
  ): any {

    const src =
      cv.matFromImageData(
        imageData
      );

    try {

      const gray =
        this.toGray(src);

      const normalized =
        this.normalizeContrast(
          gray
        );

      gray.delete();

      const threshold =
        this.adaptiveThreshold(
          normalized
        );

      normalized.delete();

      return threshold;

    } finally {

      src.delete();

    }

  }

}
