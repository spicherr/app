import {
  Injectable,
  signal,
} from '@angular/core';

import { DartBoard } from '../models/dart-board.model';

declare const cv: any;

@Injectable({
  providedIn: 'root',
})
export class BoardDetectionService {
  readonly board = signal<DartBoard | null>(
    null
  );

  readonly detecting = signal(false);

  readonly error = signal<string | null>(
    null
  );

  detectBoard(
    imageData: ImageData
  ): DartBoard | null {
    try {
      this.detecting.set(true);
      this.error.set(null);

      const src = cv.matFromImageData(
        imageData
      );

      const gray = new cv.Mat();

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
        2
      );

      const circles = new cv.Mat();

      cv.HoughCircles(
        gray,
        circles,
        cv.HOUGH_GRADIENT,
        1,
        100,
        120,
        40,
        150,
        600
      );

      let board: DartBoard | null = null;

      if (circles.cols > 0) {
        const data = circles.data32F;

        board = {
          centerX: data[0],
          centerY: data[1],
          radius: data[2],
          confidence: 1,
        };

        this.board.set(board);
      }

      src.delete();
      gray.delete();
      circles.delete();

      return board;
    } catch (error) {
      console.error(error);

      this.error.set(
        'Board konnte nicht erkannt werden'
      );

      return null;
    } finally {
      this.detecting.set(false);
    }
  }

  trackBoard(
    imageData: ImageData
  ): DartBoard | null {
    const current = this.board();

    if (!current) {
      return this.detectBoard(
        imageData
      );
    }

    const board = this.detectBoard(
      imageData
    );

    if (!board) {
      return current;
    }

    const alpha = 0.2;

    const smoothed: DartBoard = {
      centerX:
        current.centerX +
        (board.centerX -
          current.centerX) *
        alpha,

      centerY:
        current.centerY +
        (board.centerY -
          current.centerY) *
        alpha,

      radius:
        current.radius +
        (board.radius -
          current.radius) *
        alpha,

      confidence:
      board.confidence,
    };

    this.board.set(smoothed);

    return smoothed;
  }

  clear(): void {
    this.board.set(null);
  }
}
