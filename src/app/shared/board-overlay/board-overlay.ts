import {
  AfterViewInit,
  Component,
  ElementRef,
  effect,
  input,
  ViewChild,
} from '@angular/core';

import { DartBoard } from '../../core/models/dart-board.model';
import { Dart } from '../../core/models/dart.model';

@Component({
  selector: 'app-board-overlay',
  standalone: true,
  templateUrl: './board-overlay.html',
  styleUrl: './board-overlay.scss',
})
export class BoardOverlay
  implements AfterViewInit
{
  readonly board =
    input<DartBoard | null>(null);

  readonly darts =
    input<Dart[]>([]);

  readonly debug =
    input<boolean>(true);

  @ViewChild('overlay')
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;

  constructor() {
    effect(() => {
      this.redraw();
    });
  }

  ngAfterViewInit(): void {
    const ctx =
      this.canvasRef.nativeElement.getContext(
        '2d'
      );

    if (!ctx) {
      return;
    }

    this.ctx = ctx;

    this.redraw();
  }

  private redraw(): void {
    if (!this.ctx) {
      return;
    }

    const canvas =
      this.canvasRef.nativeElement;

    this.ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const board = this.board();

    if (!board) {
      return;
    }

    this.drawBoard(board);

    this.drawSegments(board);

    this.drawDarts();
  }

  private drawBoard(
    board: DartBoard
  ): void {
    this.ctx.beginPath();

    this.ctx.arc(
      board.centerX,
      board.centerY,
      board.radius,
      0,
      Math.PI * 2
    );

    this.ctx.strokeStyle =
      '#00ff00';

    this.ctx.lineWidth = 3;

    this.ctx.stroke();

    this.ctx.beginPath();

    this.ctx.arc(
      board.centerX,
      board.centerY,
      5,
      0,
      Math.PI * 2
    );

    this.ctx.fillStyle =
      '#ff0000';

    this.ctx.fill();
  }

  private drawSegments(
    board: DartBoard
  ): void {
    for (
      let i = 0;
      i < 20;
      i++
    ) {
      const angle =
        ((i * 18) - 90) *
        (Math.PI / 180);

      const x =
        board.centerX +
        Math.cos(angle) *
        board.radius;

      const y =
        board.centerY +
        Math.sin(angle) *
        board.radius;

      this.ctx.beginPath();

      this.ctx.moveTo(
        board.centerX,
        board.centerY
      );

      this.ctx.lineTo(x, y);

      this.ctx.strokeStyle =
        'rgba(255,255,255,.2)';

      this.ctx.lineWidth = 1;

      this.ctx.stroke();
    }
  }

  private drawDarts(): void {
    for (const dart of this.darts()) {
      this.ctx.beginPath();

      this.ctx.arc(
        dart.tipX,
        dart.tipY,
        8,
        0,
        Math.PI * 2
      );

      this.ctx.fillStyle =
        '#00ffff';

      this.ctx.fill();
    }
  }
}
