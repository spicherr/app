import {
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';

import {
  SettingsService,
} from './settings';

import {
  BoardDetector,
} from '../vision/board-detector';

import {
  BoardTracker,
} from '../vision/board-tracker';

import {
  DetectedBoard,
} from '../models/dart-board.model';

import {
  BoardDetectionState,
} from '../vision/states/board-detection-state';

@Injectable({
  providedIn: 'root',
})
export class BoardDetectionService {

  private readonly settingsService =
    inject(
      SettingsService
    );

  private readonly boardDetector =
    inject(
      BoardDetector
    );

  private readonly boardTracker =
    inject(
      BoardTracker
    );

  readonly board =
    this.boardTracker.board;

  readonly tracking =
    this.boardTracker.tracking;

  readonly state =
    signal(
      BoardDetectionState.Idle
    );

  readonly error =
    signal<string | null>(
      null
    );

  readonly hasBoard =
    computed(
      () => this.board() !== null
    );

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

    this.boardTracker.reset();

    this.state.set(
      BoardDetectionState.Searching
    );

  }

  stop(): void {

    this.boardTracker.reset();

    this.state.set(
      BoardDetectionState.Idle
    );

  }

  clear(): void {

    this.boardTracker.reset();

    this.error.set(
      null
    );

  }

  trackBoard(
    imageData: ImageData,
  ): boolean {

    const detected =
      this.boardDetector.detect(  imageData,

        this.settingsService
          .settings()
          .detectionSensitivity,

      );

    let tracking: boolean;

    if (detected) {

      tracking =
        this.boardTracker.update(
          detected
        );

    } else {

      tracking =
        this.boardTracker
          .loseFrame();

    }

    if (tracking) {

      this.startTracking();

    } else {

      this.boardLost();

    }

    return tracking;

  }

}
