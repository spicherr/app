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

import {
  DartScore,
  ScoringService,
} from './scoring';

import {
  GameService,
} from './game';

export interface ScoredDart {

  dart: Dart;

  score: DartScore;
}

@Injectable({
  providedIn: 'root',
})
export class VisionPipelineService {
  private readonly maxDartsPerTurn = 3;

  private readonly minDartDistance = 30;
  private turnFinished(): boolean {

    return (
      this.scoredDarts().length >=
      this.maxDartsPerTurn
    );
  }
  private readonly cameraService =
    inject(CameraService);

  private readonly openCvService =
    inject(OpenCvService);

  private readonly boardDetection =
    inject(BoardDetectionService);

  private readonly dartDetection =
    inject(DartDetectionService);

  private readonly scoringService =
    inject(ScoringService);

  private readonly gameService =
    inject(GameService);

  private pipelineTimer?: number;

  private previousFrame:
    ImageData | null = null;

  readonly running =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly detectedDarts =
    signal<Dart[]>([]);

  readonly scoredDarts =
    signal<ScoredDart[]>([]);

  readonly board =
    this.boardDetection
      .stableBoard;

  readonly ready =
    computed(() => {

      const video =
        this.cameraService
          .getVideoElement();

      return (
        this.openCvService.ready() &&
        this.cameraService.running() &&
        !!video &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      );
    });

  async start(): Promise<void> {

    if (this.running()) {
      return;
    }

    try {

      this.error.set(null);

      await this.waitUntilReady();

      console.log(
        'Vision Pipeline gestartet'
      );

      this.running.set(true);

      this.pipelineTimer =
        window.setInterval(
          () => {

            this.processFrame();

          },
          500
        );

    } catch (error: any) {

      console.error(error);

      this.error.set(
        error?.message ??
        'Vision Pipeline konnte nicht gestartet werden.'
      );
    }
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

    this.previousFrame =
      null;
  }

  clear(): void {

    this.detectedDarts.set([]);

    this.scoredDarts.set([]);

    this.previousFrame =
      null;

    this.error.set(
      null
    );

    this.dartDetection.clear();
  }
  startNextTurn(): void {

    this.clear();

    if (
      !this.running()
    ) {

      this.start();
    }
  }
  private processFrame(): void {

    if (
      this.turnFinished()
    ) {

      console.log(
        '3 Darts erkannt - Detection gestoppt'
      );

      this.stop();

      return;
    }

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
      const board =
        this.board();

      if (!board) {

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

      console.log(
        'Raw Darts:',
        newDarts.map(
          dart => ({
            x: Math.round(
              dart.tipX
            ),
            y: Math.round(
              dart.tipY
            ),
            confidence:
            dart.confidence,
          })
        )
      );

      if (
        newDarts.length === 0
      ) {

        this.previousFrame =
          currentFrame;

        return;
      }

      const uniqueDarts =
        this.filterNewDarts(
          newDarts
        );

      if (
        uniqueDarts.length === 0
      ) {

        this.previousFrame =
          currentFrame;

        return;
      }

      this.detectedDarts.update(
        darts => [
          ...darts,
          ...uniqueDarts,
        ]
      );

      if (board) {

        const scored =
          [...this.scoredDarts()];

        for (
          const dart of uniqueDarts
          ) {

          if (
            scored.length >=
            this.maxDartsPerTurn
          ) {

            break;
          }

          const result =
            this.scoringService
              .calculateScore(
                board,
                dart
              );

          scored.push({

            dart,

            score: result,
          });

          this.gameService.addThrow(
            result.score
          );

          console.log(
            'Dart erkannt:',
            {
              x: Math.round(
                dart.tipX
              ),
              y: Math.round(
                dart.tipY
              ),
              score:
              result.score,
              segment:
              result.segment,
              multiplier:
              result.multiplier,
            }
          );
        }

        this.scoredDarts.set(
          scored
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

  private filterNewDarts(
    incoming: Dart[]
  ): Dart[] {

    const existing =
      this.detectedDarts();

    return incoming.filter(
      dart => {

        return !existing.some(
          existingDart => {

            const dx =
              existingDart.tipX -
              dart.tipX;

            const dy =
              existingDart.tipY -
              dart.tipY;

            const distance =
              Math.sqrt(
                dx * dx +
                dy * dy
              );

            return (
              distance <
              this.minDartDistance
            );
          }
        );
      }
    );
  }

  private async waitUntilReady():
    Promise<void> {

    let attempts = 0;

    while (
      attempts < 150
      ) {

      if (
        this.ready()
      ) {

        console.log(
          'Vision Pipeline bereit'
        );

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

    const video =
      this.cameraService
        .getVideoElement();

    if (
      !this.openCvService.ready()
    ) {

      throw new Error(
        'OpenCV ist nicht bereit.'
      );
    }

    if (
      !this.cameraService.running()
    ) {

      const cameraError =
        this.cameraService.error();

      throw new Error(
        cameraError ??
        'Kamera wurde nicht gestartet.'
      );
    }

    if (!video) {
      console.log(
        'Videoelement:',
        this.cameraService.getVideoElement()
      );
      throw new Error(
        'Videoelement wurde nicht registriert.'
      );
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {

      throw new Error(
        'Videostream liefert noch keine Bilddaten.'
      );
    }
    console.log({

      openCv:
        this.openCvService.ready(),

      running:
        this.cameraService.running(),

      videoReady:
        this.cameraService.videoReady(),

      video:
        !!this.cameraService
          .getVideoElement(),

      width:
      this.cameraService
        .getVideoElement()
        ?.videoWidth,

      height:
      this.cameraService
        .getVideoElement()
        ?.videoHeight,

      board:
        this.board()
    });
    throw new Error(
      'Vision Pipeline Timeout.'
    );
  }

  getTotalScore(): number {

    return this.scoredDarts()
      .reduce(
        (
          total,
          dart
        ) =>
          total +
          dart.score.score,
        0
      );
  }

  getLastThrow():
    | ScoredDart
    | null {

    const darts =
      this.scoredDarts();

    return darts.length
      ? darts[
      darts.length - 1
        ]
      : null;
  }
}
