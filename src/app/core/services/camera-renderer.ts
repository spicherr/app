import {
  Injectable,
} from '@angular/core';

import {
  CameraRenderData,
} from '../models/camera-render-data.model';

import {
  DetectedBoard,
} from '../models/dart-board.model';

import {
  Viewport,
} from '../models/viewport.model';
import {PDC_BOARD} from '../constants/pdc-board';
import {Point} from '@angular/cdk/drag-drop';

@Injectable({
  providedIn: 'root',
})
export class CameraRendererService {

  render(
    data: CameraRenderData
  ): void {

    const {
      ctx,
      canvas,
      video,
      board,
    } = data;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    this.drawVideo(
      data
    );
    const viewport =
      board
        ? this.calculateViewport(
          board,
          video.videoWidth,
          video.videoHeight,
          canvas.width,
          canvas.height
        )
        : undefined;

    if (viewport) {

      this.drawBoard(
        data,
        viewport
      );

    }
    /**
     * Diese Methoden folgen
     * in den nächsten Schritten.
     */
    // this.drawSegments(data);
    // this.drawDarts(data);
    // this.drawDebug(data);
  }

  private drawVideo(
    data: CameraRenderData,
    viewport?: Viewport,
  ): void {

    const {

      ctx,

      canvas,

      video,

    } = data;

    /**
     * Noch kein Viewport vorhanden.
     * Gesamtes Kamerabild zeichnen.
     */
    if (!viewport) {

      ctx.drawImage(
        video,

        0,
        0,

        video.videoWidth,
        video.videoHeight,

        0,
        0,

        canvas.width,
        canvas.height
      );

      return;
    }

    /**
     * Gezoomtes Kamerabild
     */
    ctx.drawImage(
      video,

      viewport.sourceX,
      viewport.sourceY,

      viewport.sourceWidth,
      viewport.sourceHeight,

      0,
      0,

      canvas.width,
      canvas.height
    );
  }

  private drawBoard(
    data: CameraRenderData,
    viewport: Viewport,
  ): void {

    const {

      ctx,

      board,

    } = data;

    if (!board) {
      return;
    }

    const center =
      this.toCanvasCoordinates(
        board.centerX,
        board.centerY,
        viewport
      );

    const radius =
      board.outerRadius *
      viewport.scaleX;


    ctx.save();

    ctx.beginPath();

    ctx.arc(
      center.x,
      center.y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      '#00ff00';

    ctx.lineWidth = 3;

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
      center.x,
      center.y,
      6,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      '#ff0000';

    ctx.fill();

    ctx.restore();



  }

  private drawSegments(
    data: CameraRenderData,
    viewport: Viewport,
  ): void {

    const {
      ctx,
      board,
      showGrid,
    } = data;

    if (
      !board ||
      !showGrid
    ) {
      return;
    }

    const center =
      this.toCanvasCoordinates(
        board.centerX,
        board.centerY,
        viewport
      );

    const outerRadius =
      board.outerRadius *
      viewport.scaleX;

    this.drawRings(
      ctx,
      center,
      outerRadius
    );

    this.drawRadialLines(
      ctx,
      center,
      outerRadius
    );
  }
  private drawRings(
    ctx: CanvasRenderingContext2D,
    center: Point,
    outerRadius: number,
  ): void {

    const rings = [
      0.10,
      0.55,
      0.63,
      0.95,
      1.00,
    ];

    ctx.save();

    ctx.strokeStyle =
      '#00ff00';

    ctx.lineWidth = 1;

    for (
      const factor of rings
      ) {

      ctx.beginPath();

      ctx.arc(
        center.x,
        center.y,
        outerRadius * factor,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }

    ctx.restore();
  }

  private drawRadialLines(
    ctx: CanvasRenderingContext2D,
    center: Point,
    outerRadius: number,
  ): void {

    ctx.save();

    ctx.strokeStyle =
      '#00ff00';

    ctx.lineWidth = 1;

    for (
      let i = 0;
      i < 20;
      i++
    ) {

      const angle =
        (i * 18 - 9) *
        Math.PI / 180;

      const x =
        center.x +
        Math.cos(angle) *
        outerRadius;

      const y =
        center.y +
        Math.sin(angle) *
        outerRadius;

      ctx.beginPath();

      ctx.moveTo(
        center.x,
        center.y
      );

      ctx.lineTo(
        x,
        y
      );

      ctx.stroke();
    }

    ctx.restore();
  }

  private drawDebugInfo(
    data: CameraRenderData,
    viewport: Viewport,
  ): void {

    if (!data.debug) {
      return;
    }

    const {
      ctx,
      board,
      canvas,
    } = data;

    if (!board) {
      return;
    }

    const center =
      this.toCanvasCoordinates(
        board.centerX,
        board.centerY,
        viewport
      );

    ctx.save();

    //
    // Mittelpunkt
    //
    ctx.fillStyle = '#ff0000';

    ctx.beginPath();

    ctx.arc(
      center.x,
      center.y,
      4,
      0,
      Math.PI * 2
    );

    ctx.fill();

    //
    // Text
    //
    ctx.font = '14px monospace';

    ctx.fillStyle = '#00ff00';

    const lines = [

      `Canvas : ${canvas.width} x ${canvas.height}`,

      `Center : ${board.centerX.toFixed(1)} / ${board.centerY.toFixed(1)}`,

      `Radius : ${board.outerRadius.toFixed(1)}`,

      `Scale  : ${viewport.scaleX.toFixed(2)}`,

      `Offset : ${viewport.sourceX.toFixed(1)} / ${viewport.sourceY.toFixed(1)}`,

      `Conf   : ${board.confidence.toFixed(2)}`,

    ];

    lines.forEach(
      (
        line,
        index,
      ) => {

        ctx.fillText(
          line,
          10,
          20 + index * 18
        );

      }
    );

    ctx.restore();
  }

  private calculateViewport(
    board: DetectedBoard,
    imageWidth: number,
    imageHeight: number,
    canvasWidth: number,
    canvasHeight: number,
  ): Viewport {

    /**
     * 20 % Rand
     */
    const zoomFactor =
      1.20;

    const cropSize =
      board.outerRadius *
      2 *
      zoomFactor;

    let sourceX =
      board.centerX -
      cropSize / 2;

    let sourceY =
      board.centerY -
      cropSize / 2;

    sourceX =
      Math.max(
        0,
        Math.min(
          sourceX,
          imageWidth -
          cropSize
        )
      );

    sourceY =
      Math.max(
        0,
        Math.min(
          sourceY,
          imageHeight -
          cropSize
        )
      );

    const scaleX =
      canvasWidth /
      cropSize;

    const scaleY =
      canvasHeight /
      cropSize;

    return {

      sourceX,

      sourceY,

      sourceWidth:
      cropSize,

      sourceHeight:
      cropSize,

      scaleX,

      scaleY,
    };
  }

  /**
   * Hilfsmethode
   * Originalbild →
   * Canvas
   */
  private toCanvasCoordinates(
    x: number,
    y: number,
    viewport: Viewport,
  ): {

    x: number;

    y: number;

  } {

    return {

      x:
        (
          x -
          viewport.sourceX
        ) *
        viewport.scaleX,

      y:
        (
          y -
          viewport.sourceY
        ) *
        viewport.scaleY,
    };
  }
}
