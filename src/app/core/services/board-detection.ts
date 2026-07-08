import {computed, inject, Injectable, signal,} from '@angular/core';

import {CameraService} from './camera';
import {SettingsService} from './settings';
import {OpenCvService} from './open-cv';
import {BoardDetector} from '../vision/board-detector';
import {DetectedBoard} from '../models/dart-board.model';
import {BoardDetectionState,} from '../vision/states/board-detection-state';
import {BoardTracker} from '../vision/board-tracker';

@Injectable({
  providedIn: 'root',
})
export class BoardDetectionService {
  readonly state =
    signal(
      BoardDetectionState.Idle
    );
    private readonly boardTracker =
    inject(
      BoardTracker
    );
  private readonly boardDetector =
    inject(BoardDetector);
  readonly board =
    this.boardTracker.board;

  private readonly cameraService =
    inject(CameraService);

  private readonly settingsService =
    inject(SettingsService);

  private detectionTimer?: number;


  readonly error =
    signal<string | null>(null);

  readonly hasBoard = computed(
    () => this.board() !== null
  );

  start(): void {

    if (this.state() !==
    BoardDetectionState.Idle
    ) {
      return;
    }
    this.startSearching();

    this.state.set(BoardDetectionState.Searching);

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

    this.state.set(BoardDetectionState.Idle);
  }

  clear(): void {
    this.board.set(null);
  }

  trackBoard(
    imageData: ImageData,
  ): DetectedBoard | null {

    const detected =
      this.boardDetector.detect(

        imageData,

        this.settingsService
          .settings()
          .detectionSensitivity,

      );

    if (
      !detected
    ) {

      return null;

    }

    this.boardTracker.update(
      detected
    );

    return this.board();

  }
  startSearching(): void {

    this.state.set(
      BoardDetectionState.Searching
    );

  }

  startTracking(): void {

    this.state.set(
      BoardDetectionState.Tracking
    );

  }

  boardLost(): void {

    if (!this.board()) {

      this.boardLost();

    }

  }

}
