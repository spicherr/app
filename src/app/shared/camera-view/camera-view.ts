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

import { CameraService } from '../../core/services/camera';
import { OpenCvService } from '../../core/services/open-cv';

@Component({
  selector: 'app-camera-view',
  standalone: true,
  imports: [CommonModule],
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

        this.videoRef.nativeElement.srcObject =
          stream;
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {

    await this.openCvService.initialize();

    await this.cameraService.start();

    const video =
      this.videoRef.nativeElement;

    this.cameraService.registerVideoElement(
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

    await this.cameraService.loadDevices();
  }

  ngOnDestroy(): void {

    this.cameraService.stop();
  }
}
