import {DetectedBoard} from '../models/dart-board.model';
import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class BoardTracker {
  readonly board =
    signal<DetectedBoard | null>(
      null
    );
  readonly lostFrames =
    signal(0);
  update(
    detected: DetectedBoard
  ): void {

    const current =
      this.board();

    if (
      !current
    ) {

      this.board.set(
        detected
      );

      return;

    }

    const alpha =
      0.15;

    this.board.set({

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

    });

  }
  isTracking(): boolean {

    return (
      this.board() !== null
    );

  }
  lost(): void {

    this.lostFrames.update(
      value => value + 1
    );

  }
  reset(): void {

    this.board.set(
      null
    );

    this.lostFrames.set(
      0
    );

  }
}
