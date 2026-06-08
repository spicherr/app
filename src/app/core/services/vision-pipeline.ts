import {
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';

import {
  CameraService,
} from './camera';

import {
  OpenCvService,
} from './open-cv';

import {
  BoardDetectionService,
} from './board-detection';

import {
  Dart,
  DartDetectionService,
} from './dart-detection';

@Injectable({
  providedIn: 'root',
})
export class VisionPipelineService {

  private readonly cameraService =
    inject(CameraService);

  private readonly openCvService =
    inject(OpenCvService);

  private readonly boardDetection =
    inject(BoardDetectionService);

  private readonly dartDetection =
    inject(DartDetectionService);

  private pipelineTimer?: number;

  private previousFrame:
    ImageData | null = null;

  readonly running =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly detectedDarts =
    signal<Dart[]>([]);

  readonly board =
    this.boardDetection.board;

  readonly ready = computed(
    () =>
      this.openCvService.ready() &&
      this.cameraService.running()
  );

  async start(): Promise<void> {

    if (this.running()) {
      return;
    }

    await this.waitUntilReady();

    this.running.set(true);

    this.pipelineTimer =
      window.setInterval(
        () => {

          this.processFrame();

        },
        250
      );
  }

  stop(): void {

    if (this.pipelineTimer) {

      clearInterval(
        this.pipelineTimer
      );

      this.pipelineTimer =
        undefined;
    }

    this.running.set(false);
  }

  clearDarts(): void {

    this.detectedDarts.set([]);

    this.dartDetection.clear();
  }

  private processFrame(): void {

    try {

      const currentFrame =
        this.cameraService
          .captureCurrentFrame();

      if (!currentFrame) {
        return;
      }

      this.boardDetection.trackBoard(
        currentFrame
      );

      if (!this.previousFrame) {

        this.previousFrame =
          currentFrame;

        return;
      }

      const newDarts =
        this.dartDetection
          .detectNewDarts(
            this.previousFrame,
            currentFrame
          );

      if (
        newDarts.length > 0
      ) {

        const merged =
          this.mergeDarts(
            this.detectedDarts(),
            newDarts
          );

        this.detectedDarts.set(
          merged
        );
      }

      this.previousFrame =
        currentFrame;

    } catch (error) {

      console.error(error);

      this.error.set(
        'Vision Pipeline Fehler'
      );
    }
  }

  private mergeDarts(
    existing: Dart[],
    incoming: Dart[]
  ): Dart[] {

    const result =
      [...existing];

    for (
      const dart of incoming
      ) {

      const alreadyExists =
        existing.some(
          existingDart => {

            const dx =
              existingDart.tipX -
              dart.tipX;

            const dy =
              existingDart.tipY -
              dart.tipY;

            return (
              Math.sqrt(
                dx * dx +
                dy * dy
              ) < 20
            );
          }
        );

      if (
        !alreadyExists
      ) {

        result.push(
          dart
        );
      }
    }

    return result;
  }

  private async waitUntilReady():
    Promise<void> {

    let attempts = 0;

    while (
      attempts < 150
      ) {

      const video =
        this.cameraService
          .getVideoElement();

      const videoReady =
        !!video &&
        video.videoWidth > 0 &&
        video.videoHeight > 0;

      if (
        this.openCvService.ready() &&
        this.cameraService.running() &&
        videoReady
      ) {

        return;
      }

      attempts++;

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            100
          )
      );
    }

    throw new Error(
      'Vision Pipeline Timeout'
    );
  }
}
