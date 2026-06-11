import {
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CameraService } from './camera';
import { SettingsService } from './settings';
import { OpenCvService } from './open-cv';

export interface DartBoard {
  centerX: number;
  centerY: number;
  radius: number;
  confidence: number;
}

declare const cv: any;

@Injectable({
  providedIn: 'root',
})
export class BoardDetectionService {
  readonly stableBoard =
    signal<DartBoard | null>(null);
  private readonly cameraService =
    inject(CameraService);

  private readonly settingsService =
    inject(SettingsService);

  private readonly openCvService =
    inject(OpenCvService);

  private detectionTimer?: number;

  readonly board =
    signal<DartBoard | null>(null);

  readonly running =
    signal(false);

  readonly detecting =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly hasBoard = computed(
    () => this.board() !== null
  );

  start(): void {

    if (this.running()) {
      return;
    }

    this.running.set(true);

    this.detectionTimer =
      window.setInterval(() => {

        const frame =
          this.cameraService.captureCurrentFrame();

        if (!frame) {
          return;
        }

        this.trackBoard(frame);

      }, 250);
  }

  stop(): void {

    if (this.detectionTimer) {
      clearInterval(
        this.detectionTimer
      );

      this.detectionTimer = undefined;
    }

    this.running.set(false);
  }

  clear(): void {
    this.board.set(null);
  }

  trackBoard(
    imageData: ImageData
  ): DartBoard | null {

    const detected =
      this.detectBoard(
        imageData
      );

    if (!detected) {
      return this.board();
    }

    const current =
      this.board();

    if (!current) {

      this.board.set(
        detected
      );

      return detected;
    }

    const alpha = 0.2;

    const smoothed: DartBoard = {

      centerX:
        current.centerX +
        (
          detected.centerX -
          current.centerX
        ) * alpha,

      centerY:
        current.centerY +
        (
          detected.centerY -
          current.centerY
        ) * alpha,

      radius:
        current.radius +
        (
          detected.radius -
          current.radius
        ) * alpha,

      confidence:
      detected.confidence,
    };

    this.board.set(
      smoothed
    );

    return smoothed;
  }

  detectBoard(
    imageData: ImageData
  ): DartBoard | null {

    if (!this.openCvService.ready()) {
      return null;
    }

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

      this.detecting.set(true);
      this.error.set(null);

      src = new cv.Mat(
        imageData.height,
        imageData.width,
        cv.CV_8UC4
      );

      src.data.set(
        imageData.data
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

      const sensitivity =
        this.settingsService
          .settings()
          .detectionSensitivity;

      const param2 =
        Math.max(
          20,
          70 - sensitivity * 0.5
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
        !circles ||
        circles.cols === 0
      ) {
        return null;
      }

      let bestIndex = 0;
      let largestRadius = 0;

      for (
        let i = 0;
        i < circles.cols;
        i++
      ) {

        const radius =
          circles.data32F[
          i * 3 + 2
            ];

        if (
          radius >
          largestRadius
        ) {

          largestRadius =
            radius;

          bestIndex = i;
        }
      }

      const offset =
        bestIndex * 3;

      const centerX =
        circles.data32F[offset];

      const centerY =
        circles.data32F[
        offset + 1
          ];

      const radius =
        circles.data32F[
        offset + 2
          ];
      const confidence =
        Math.min(
          1,
          radius /
          maxRadius
        );
      const board: DartBoard = {
        centerX,
        centerY,
        radius,
//      TODO: confidence berechnen lassen
        confidence: 1,
      };

      this.board.set(
        board
      );
      console.log({
        radius,
        maxRadius,
        confidence,
      });
//     if (
//       board.confidence >= 0.8
//     ) {
//       this.stableBoard.set(
//         board
//       );
//     }
//      TODO: reaktiviere board.confidence
       this.stableBoard.set(board);

      return board;

    } catch (error) {

      console.error(
        'BoardDetection Error',
        error
      );

      this.error.set(
        'Board-Erkennung fehlgeschlagen'
      );

      return null;

    } finally {

      src?.delete?.();
      gray?.delete?.();
      circles?.delete?.();

      this.detecting.set(false);
    }
  }
}
