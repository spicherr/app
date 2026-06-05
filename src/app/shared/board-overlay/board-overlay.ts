import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  effect,
  inject,
  input,
} from '@angular/core';

import { CameraService } from '../../core/services/camera';
import { DartBoard } from '../../core/services/board-detection';

export interface Dart {
  id: string;

  tipX: number;
  tipY: number;

  confidence: number;
}

@Component({
  selector: 'app-board-overlay',
  standalone: true,
  templateUrl: './board-overlay.html',
  styleUrl: './board-overlay.scss',
})
export class BoardOverlay
  implements AfterViewInit {

  private readonly cameraService =
    inject(CameraService);

  readonly board =
    input<DartBoard | null>(null);

  readonly darts =
    input<Dart[]>([]);

  readonly debug =
    input(false);

  @ViewChild('canvas')
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx?: CanvasRenderingContext2D;

  constructor() {

    effect(() => {

      this.redraw();

    });
  }

  ngAfterViewInit(): void {

    this.ctx =
      this.canvasRef
        .nativeElement
        .getContext('2d') ?? undefined;

    this.resizeCanvas();

    window.addEventListener(
      'resize',
      () => this.resizeCanvas()
    );

    this.redraw();
  }

  private resizeCanvas(): void {

    const video =
      this.cameraService.getVideoElement();

    if (!video) {
      return;
    }

    const canvas =
      this.canvasRef.nativeElement;

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;
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

    const board =
      this.board();

    if (!board) {
      return;
    }

    this.drawBoard(board);

    if (this.debug()) {

      this.drawSegments(board);

      this.drawDebugInfo(board);
    }

    this.drawDarts();
  }

  private drawBoard(
    board: DartBoard
  ): void {

    if (!this.ctx) {
      return;
    }

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

    this.ctx.lineWidth = 4;

    this.ctx.stroke();

    this.ctx.beginPath();

    this.ctx.arc(
      board.centerX,
      board.centerY,
      6,
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

    if (!this.ctx) {
      return;
    }

    for (
      let i = 0;
      i < 20;
      i++
    ) {

      const angle =
        ((i * 18) - 90) *
        Math.PI / 180;

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

      this.ctx.lineTo(
        x,
        y
      );

      this.ctx.strokeStyle =
        'rgba(255,255,255,.3)';

      this.ctx.lineWidth = 1;

      this.ctx.stroke();
    }
  }

  private drawDarts(): void {

    if (!this.ctx) {
      return;
    }

    for (
      const dart of this.darts()
      ) {

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

  private drawDebugInfo(
    board: DartBoard
  ): void {

    if (!this.ctx) {
      return;
    }

    this.ctx.fillStyle =
      '#00ff00';

    this.ctx.font =
      '18px monospace';

    this.ctx.fillText(
      `X ${board.centerX.toFixed(0)}`,
      20,
      30
    );

    this.ctx.fillText(
      `Y ${board.centerY.toFixed(0)}`,
      20,
      55
    );

    this.ctx.fillText(
      `R ${board.radius.toFixed(0)}`,
      20,
      80
    );

    this.ctx.fillText(
      `C ${board.confidence.toFixed(2)}`,
      20,
      105
    );
  }
}
