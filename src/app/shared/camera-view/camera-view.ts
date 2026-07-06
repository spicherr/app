import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject, input, computed,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  MatButtonModule,
} from '@angular/material/button';

import {
  CameraService,
} from '../../core/services/camera';

import {
  OpenCvService,
} from '../../core/services/open-cv';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';


import {CameraRendererService} from '../../core/services/camera-renderer';
import {Dart} from '../../core/models/dart.model';
import {DetectedBoard} from '../../core/models/dart-board.model';



@Component({
  selector: 'app-camera-view',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,MatFormFieldModule, MatSelectModule
  ],
  templateUrl: './camera-view.html',
  styleUrl: './camera-view.scss',
})


export class CameraView
  implements AfterViewInit, OnDestroy {
  readonly board =
    input<DetectedBoard | null>(
      null
    );

  readonly zoom = input(2);
  private readonly renderer =
    inject(
      CameraRendererService
    );
  readonly darts =
    input<Dart[]>([]);

  readonly debug =
    input(false);

  readonly showBoardGrid =
    input(true);
  private readonly cameraService =
    inject(CameraService);

  private readonly openCvService =
    inject(OpenCvService);

  @ViewChild('video')
  videoRef!: ElementRef<HTMLVideoElement>;

  @ViewChild('canvas')
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx?:
    CanvasRenderingContext2D;

  private animationFrame?: number;

  readonly camera =
    this.cameraService;

  readonly openCv =
    this.openCvService;

  async ngAfterViewInit():
    Promise<void> {

    try {
      console.log(
        'CameraView registriert Video'
      );
      const video =
        this.videoRef
          .nativeElement;

      this.cameraService
        .registerVideoElement(
          video
        );

      await this.openCvService
        .initialize();

      await this.cameraService
        .loadDevices();

      if (
        this.cameraService
          .devices()
          .length === 0
      ) {

        this.cameraService.error.set(
          'Keine Kamera gefunden.'
        );

        return;
      }

      await this.cameraService
        .start();
      this.initializeCanvas();

      this.renderLoop();

    } catch (error) {

      console.error(error);

      this.cameraService.error.set(
        'Kamera konnte nicht gestartet werden.'
      );
    }
  }

  ngOnDestroy(): void {
    if (
      this.animationFrame
    ) {

      cancelAnimationFrame(
        this.animationFrame
      );
    }

    this.cameraService.stop();
  }

  async reloadCamera():
    Promise<void> {

    try {

      this.cameraService.error.set(
        null
      );

      await this.cameraService
        .start();

    } catch (error) {

      console.error(error);
    }
  }
  private initializeCanvas(): void {

    const video =
      this.videoRef.nativeElement;

    const canvas =
      this.canvasRef.nativeElement;

    this.ctx =
      canvas.getContext('2d') ?? undefined;

    const resize = () => {

      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;

      console.log(
        'Canvas initialisiert:',
        canvas.width,
        canvas.height
      );
    };

    if (
      this.cameraService.videoReady()
    ) {

      resize();

      return;
    }

    const wait =
      window.setInterval(() => {

        if (
          this.cameraService.videoReady()
        ) {

          clearInterval(wait);

          resize();
        }

      }, 50);
  }

  private renderLoop = (): void => {

    const video =
      this.videoRef
        .nativeElement;

    const canvas =
      this.canvasRef
        .nativeElement;

    if (
      !this.ctx ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {

      this.animationFrame =
        requestAnimationFrame(
          this.renderLoop
        );

      return;
    }

    this.ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const ctx = this.ctx;


    this.renderer.render({
      ctx,
      canvas,
      video,
      board: this.board(),
      darts: this.darts(),
      debug: this.debug(),
      showGrid: this.showBoardGrid(),
    });

    this.animationFrame =
      requestAnimationFrame(
        this.renderLoop
      );
  };


  async changeCamera(
    deviceId: string
  ): Promise<void> {

    try {

      await this.cameraService
        .switchCamera(
          deviceId
        );

    } catch (error) {

      console.error(error);

      this.cameraService.error.set(
        'Kamerawechsel fehlgeschlagen.'
      );
    }
  }
}
