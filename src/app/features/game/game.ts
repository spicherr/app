import {
  AfterViewInit,
  Component,
  DestroyRef,
  computed,
  inject,
} from '@angular/core';

import { CameraView } from '../../shared/camera-view/camera-view';
import { BoardOverlay } from '../../shared/board-overlay/board-overlay';

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
  CameraService,
} from '../../core/services/camera';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CameraView,
    BoardOverlay,
  ],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class Game
  implements AfterViewInit {

  private readonly destroyRef =
    inject(DestroyRef);

  readonly boardDetection =
    inject(BoardDetectionService);

  readonly cameraService =
    inject(CameraService);

  readonly openCvService =
    inject(OpenCvService);

  readonly settingsService =
    inject(SettingsService);

  readonly board =
    this.boardDetection.board;

  readonly debugMode =
    computed(
      () =>
        this.settingsService
          .settings()
          .debugMode
    );

  readonly darts =
    computed(() => []);

  async ngAfterViewInit(): Promise<void> {

    await this.waitUntilReady();

    this.boardDetection.start();

    this.destroyRef.onDestroy(() => {

      this.boardDetection.stop();

    });
  }

  private async waitUntilReady():
    Promise<void> {

    let attempts = 0;

    while (attempts < 100) {

      const openCvReady =
        this.openCvService.ready();

      const cameraRunning =
        this.cameraService.running();

      const video =
        this.cameraService.getVideoElement();

      const videoReady =
        !!video &&
        video.videoWidth > 0 &&
        video.videoHeight > 0;

      if (
        openCvReady &&
        cameraRunning &&
        videoReady
      ) {

        console.log(
          'Vision Pipeline bereit'
        );

        return;
      }

      attempts++;

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            100
          )
      );
    }

    console.warn(
      'Vision Pipeline Timeout'
    );
  }
}
