import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
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

@Component({
  selector: 'app-camera-view',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
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

  async ngAfterViewInit():
    Promise<void> {

    try {

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

    } catch (error) {

      console.error(error);

      this.cameraService.error.set(
        'Kamera konnte nicht gestartet werden.'
      );
    }
  }

  ngOnDestroy(): void {

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
