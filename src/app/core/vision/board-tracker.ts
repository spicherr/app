import {
  Injectable,
  computed,
  signal,
} from '@angular/core';

import {
  DetectedBoard,
} from '../models/dart-board.model';

@Injectable({
  providedIn: 'root',
})
export class BoardTracker {

  private readonly alpha =
    0.15;

  private readonly maxLostFrames =
    5;

  readonly board =
    signal<DetectedBoard | null>(
      null
    );

  readonly lostFrames =
    signal(0);

  readonly tracking =
    computed(
      () => this.board() !== null
    );

  update(
    detected: DetectedBoard,
  ): boolean {

    this.lostFrames.set(0);

    const current =
      this.board();

    if (!current) {

      this.board.set(
        detected
      );

      return true;

    }

    this.board.set({

      centerX:
        current.centerX +
        (
          detected.centerX -
          current.centerX
        ) * this.alpha,

      centerY:
        current.centerY +
        (
          detected.centerY -
          current.centerY
        ) * this.alpha,

      outerRadius:
        current.outerRadius +
        (
          detected.outerRadius -
          current.outerRadius
        ) * this.alpha,

      confidence:
        current.confidence +
        (
          detected.confidence -
          current.confidence
        ) * this.alpha,

    });

    return true;

  }

  loseFrame(): boolean {

    this.lostFrames.update(
      frames => frames + 1
    );

    if (
      this.lostFrames() <
      this.maxLostFrames
    ) {

      return true;

    }

    this.reset();

    return false;

  }

  reset(): void {

    this.board.set(
      null
    );

    this.lostFrames.set(
      0
    );

  }

  isTracking(): boolean {

    return (
      this.board() !== null
    );

  }

}
