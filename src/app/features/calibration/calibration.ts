import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  MatButtonModule,
} from '@angular/material/button';

import {
  MatSelectModule,
} from '@angular/material/select';

import {
  CameraService,
} from '../../core/services/camera';

import {
  BoardDetectionService,
} from '../../core/services/board-detection';

import {
  SettingsService,
} from '../../core/services/settings';

import {
  OpenCvService,
} from '../../core/services/open-cv';

import {
  BoardOverlay,
} from '../../shared/board-overlay/board-overlay';

@Component({
  selector: 'app-calibration',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatSelectModule,
    BoardOverlay,
  ],
  templateUrl: './calibration.html',
  styleUrl: './calibration.scss',
})
export class Calibration
  implements AfterViewInit {

  private readonly cameraService =
    inject(CameraService);

  private readonly boardDetection =
    inject(BoardDetectionService);

  private readonly settingsService =
    inject(SettingsService);

  private readonly openCvService =
    inject(OpenCvService);

  @ViewChild('video')
  videoRef!:
    ElementRef<HTMLVideoElement>;

  readonly camera =
    this.cameraService;

  readonly board =
    this.boardDetection.board;

  readonly boardDetected =
    computed(
      () => !!this.board()
    );

  readonly calibrationSaved =
    signal(false);

  async ngAfterViewInit():
    Promise<void> {

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
        .length > 0
    ) {

      await this.cameraService
        .start();
    }

    this.boardDetection.start();
  }

  async changeCamera(
    deviceId: string
  ): Promise<void> {

    await this.cameraService
      .switchCamera(
        deviceId
      );
  }

  saveCalibration(): void {

    const board =
      this.board();

    if (!board) {
      return;
    }

    this.settingsService
      .updateBoardCalibration(
        board.centerX,
        board.centerY,
        board.radius
      );

    this.boardDetection.stop();

    this.calibrationSaved.set(
      true
    );

    console.log(
      'Kalibrierung gespeichert'
    );
  }
}
