import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  CameraService,
} from '../../core/services/camera';

import {
  OpenCvService,
} from '../../core/services/open-cv';

@Component({
  selector: 'app-camera-view',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './camera-view.html',
  styleUrl: './camera-view.scss',
})
export class CameraView
  implements AfterViewInit, OnDestroy {

  private readonly cameraService =
    inject(CameraService);

  private readonly openCvService =
    inject(OpenCvService);

  @ViewChild('video')
  videoRef!: ElementRef<HTMLVideoElement>;

  readonly camera =
    this.cameraService;

  readonly openCv =
    this.openCvService;

  constructor() {

    effect(() => {

      const stream =
        this.camera.stream();

      if (
        stream &&
        this.videoRef
      ) {

        this.videoRef
          .nativeElement
          .srcObject = stream;
      }
    });
  }

  async ngAfterViewInit():
    Promise<void> {

    try {

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

      const video =
        this.videoRef
          .nativeElement;

      this.cameraService
        .registerVideoElement(
          video
        );

      video.onloadedmetadata =
        () => {

          console.log(
            'Video bereit:',
            video.videoWidth,
            video.videoHeight
          );
        };

    } catch (error: any) {

      console.error(
        'CameraView Fehler',
        error
      );

      if (
        error?.name ===
        'NotFoundError'
      ) {

        this.cameraService.error.set(
          'Die ausgewählte Kamera wurde nicht gefunden.'
        );

        return;
      }

      if (
        error?.name ===
        'NotAllowedError'
      ) {

        this.cameraService.error.set(
          'Der Kamerazugriff wurde verweigert.'
        );

        return;
      }

      if (
        error?.name ===
        'NotReadableError'
      ) {

        this.cameraService.error.set(
          'Die Kamera wird bereits von einer anderen Anwendung verwendet.'
        );

        return;
      }

      this.cameraService.error.set(
        'Kamera konnte nicht gestartet werden.'
      );
    }
  }

  ngOnDestroy(): void {

    this.cameraService.stop();
  }
  async changeCamera(
    deviceId: string
  ): Promise<void> {

    try {

      await this.cameraService.switchCamera(
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
