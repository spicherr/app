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
  VisionPipelineService,
} from '../../core/services/vision-pipeline';

import {
  SettingsService,
} from '../../core/services/settings';

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

  readonly pipeline =
    inject(
      VisionPipelineService
    );

  readonly settingsService =
    inject(SettingsService);

  readonly debugMode =
    computed(
      () =>
        this.settingsService
          .settings()
          .debugMode
    );

  async ngAfterViewInit(): Promise<void> {

    await this.pipeline.start();

    this.destroyRef.onDestroy(() => {

      this.pipeline.stop();

    });
  }
}
