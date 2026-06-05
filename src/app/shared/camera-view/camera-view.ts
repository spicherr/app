import {
  AfterViewInit,
  Component,
  ElementRef,
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
  styleUrls: ['./camera-view.scss'],
})
export class CameraView
  implements AfterViewInit
{
  private readonly cameraService =
    inject(CameraService);

  private readonly openCvService =
    inject(OpenCvService);

  @ViewChild('video')
  videoRef!: ElementRef<HTMLVideoElement>;

  readonly camera =
    this.cameraService;

  readonly opencv =
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
  }

  async changeCamera(
    event: Event
  ): Promise<void> {
    const select =
      event.target as HTMLSelectElement;

    await this.cameraService.switchCamera(
      select.value
    );
  }
}
