import {
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CameraService } from './camera';
import { SettingsService } from './settings';
import { OpenCvService } from './open-cv';
import {BoardDetector} from '../vision/board-detector';
import {DetectedBoard} from '../models/dart-board.model';


declare const cv: any;

@Injectable({
  providedIn: 'root',
})
export class BoardDetectionService {
  readonly calibrated =
    signal(false);

  readonly stableBoard =
    signal<DetectedBoard | null>(null);
  private readonly cameraService =
    inject(CameraService);

  private readonly settingsService =
    inject(SettingsService);

  private readonly openCvService =
    inject(OpenCvService);
  private readonly boardDetector =
    inject(BoardDetector);
  private detectionTimer?: number;

  readonly board =
    signal<DetectedBoard | null>(null);

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
  ): DetectedBoard | null {

    const detected =
      this.boardDetector.detect(
        imageData,
        this.settingsService
          .settings()
          .detectionSensitivity
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
      this.stableBoard.set(
        detected
      );
      return detected;
    }

    const alpha = 0.2;

    const smoothed: DetectedBoard = {

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

      outerRadius:
        current.outerRadius +
        (
          detected.outerRadius -
          current.outerRadius
        ) * alpha,

      confidence:
      detected.confidence,
    };

    this.board.set(
      smoothed
    );
    this.stableBoard.set(
      smoothed
    );
    return smoothed;
  }

}
