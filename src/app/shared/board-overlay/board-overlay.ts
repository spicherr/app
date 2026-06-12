import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  effect,
  inject,
  input,
} from '@angular/core';

import {
  CameraService,
} from '../../core/services/camera';

import {
  DartBoard,
} from '../../core/services/board-detection';
import {
  PDC_BOARD,
  PDC_SEGMENTS,
} from '../../core/constants/pdc-board';
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
  readonly showBoardGrid =
    input(true);
  private readonly cameraService =
    inject(CameraService);

  readonly board =
    input<DartBoard | null>(
      null
    );

  readonly darts =
    input<Dart[]>([]);

  readonly debug =
    input(false);

  @ViewChild('canvas')
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx?:
    CanvasRenderingContext2D;

  constructor() {

    effect(() => {

      const board =
        this.board();

      const darts =
        this.darts();

      const debug =
        this.debug();

      const showGrid =
        this.showBoardGrid();

      console.log(
        'Overlay Update',
        board
      );

      this.redraw();

    });
  }

  ngAfterViewInit(): void {

    this.ctx =
      this.canvasRef
        .nativeElement
        .getContext('2d') ??
      undefined;

    this.resizeCanvas();

    window.addEventListener(
      'resize',
      () => this.resizeCanvas()
    );
    this.redraw();
  }

  private resizeCanvas(): void {

    const video =
      this.cameraService
        .getVideoElement();

    if (!video) {
      return;
    }

    const canvas =
      this.canvasRef
        .nativeElement;

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
      this.canvasRef
        .nativeElement;

    this.ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const board =
      this.board();
    if (!board) {
      console.log("Kein Board vorhanden");

      return;
    }
    this.drawBoard(board);

    if (
      this.showBoardGrid()
    ) {

      this.drawSegments(
        board
      );

      this.drawDebugInfo(
        board
      );
    }

    this.drawDarts();
  }

  private drawBoard(
    board: DartBoard
  ): void {
    console.log("drawBoard");

    if (!this.ctx) {
      return;
    }

    this.ctx.save();

    /**
     * Board-Kreis
     */
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

    /**
     * Mittelpunkt
     */
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

    if (
      this.debug()
    ) {

      this.ctx.fillStyle =
        '#00ff00';

      this.ctx.font =
        '14px monospace';

      this.ctx.fillText(
        'CENTER',
        board.centerX + 12,
        board.centerY - 12
      );
    }

    this.ctx.restore();
  }
  private drawRing(
    board: DartBoard,
    relativeRadius: number
  ): void {

    if (!this.ctx) {
      return;
    }

    this.ctx.beginPath();

    this.ctx.arc(
      board.centerX,
      board.centerY,
      board.radius *
      relativeRadius,
      0,
      Math.PI * 2
    );

    this.ctx.strokeStyle =
      '#00cc66';

    this.ctx.lineWidth =
      2;

    this.ctx.stroke();
  }
  private drawSegments(
    board: DartBoard
  ): void {
    console.log("drawSegments");
    if (!this.ctx) {
      return;
    }

    this.ctx.save();

    for (
      let i = 0;
      i < 20;
      i++
    ) {

      const angle =
        ((i * 18) - 90) *
        Math.PI /
        180;
      const outerRadius =
        board.radius *
        PDC_BOARD.doubleOuter;

      const x =
        board.centerX +
        Math.cos(angle) *
        outerRadius;

      const y =
        board.centerY +
        Math.sin(angle) *
        outerRadius;

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
        '#00cc66';

      this.ctx.lineWidth = 1;

      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private drawDarts(): void {
    console.log("drawDarts");
    if (!this.ctx) {
      return;
    }

    this.ctx.save();

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

      if (
        this.debug()
      ) {

        this.ctx.fillStyle =
          '#ffffff';

        this.ctx.font =
          '12px monospace';

        this.ctx.fillText(
          `${Math.round(
            dart.tipX
          )},${Math.round(
            dart.tipY
          )}`,
          dart.tipX + 12,
          dart.tipY
        );
      }
    }

    this.ctx.restore();
  }

  private drawDebugInfo(
    board: DartBoard
  ): void {
    console.log("drawDebugInfo");
    if (!this.ctx) {
      return;
    }

    const ctx =
      this.ctx;

    const lines = [

      `X: ${board.centerX.toFixed(0)}`,

      `Y: ${board.centerY.toFixed(0)}`,

      `Radius: ${board.radius.toFixed(0)}`,

      `Confidence: ${board.confidence.toFixed(2)}`,

      `Darts: ${this.darts().length}`,
    ];

    const padding = 10;

    const lineHeight = 20;

    const width = 220;

    const height =
      lines.length *
      lineHeight +
      padding * 2;

    ctx.save();

    /**
     * Hintergrund
     */
    ctx.fillStyle =
      'rgba(0,0,0,0.75)';

    ctx.fillRect(
      10,
      10,
      width,
      height
    );

    /**
     * Text
     */
    ctx.font =
      '14px monospace';

    ctx.fillStyle =
      '#ffffff';

    lines.forEach(
      (
        line,
        index
      ) => {

        ctx.fillText(
          line,
          20,
          30 +
          index *
          lineHeight
        );
      }
    );

    ctx.restore();
  }
}
