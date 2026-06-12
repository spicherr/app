import {
  AfterViewInit,
  Component,
  DestroyRef,
  computed,
  inject, signal,
} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';
import { CameraView } from '../../shared/camera-view/camera-view';
import { BoardOverlay } from '../../shared/board-overlay/board-overlay';

import {
  VisionPipelineService,
} from '../../core/services/vision-pipeline';

import {
  SettingsService,
} from '../../core/services/settings';

import {
  DartScore,
} from '../../core/services/scoring';
import {MatBadgeModule} from '@angular/material/badge';
import {Scoreboard} from '../../shared/scoreboard/scoreboard';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    MatChipsModule,
    MatBadgeModule,
    CommonModule,
    CameraView,
    BoardOverlay,
    Scoreboard
  ],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class Game
  implements AfterViewInit {
  readonly showBoardGrid =  true;
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

  async ngAfterViewInit():
    Promise<void> {

    await this.pipeline.start();

    this.destroyRef.onDestroy(
      () => {

        this.pipeline.stop();

      }
    );
  }
  nextTurn(): void {

    this.pipeline.startNextTurn();
  }
  formatSegment(
    score: DartScore
  ): string {

    if (
      score.segment === 0
    ) {

      return 'MISS';
    }

    if (
      score.segment === 25 &&
      score.multiplier === 2
    ) {

      return 'BULL';
    }

    if (
      score.segment === 25
    ) {

      return '25';
    }

    if (
      score.multiplier === 3
    ) {

      return `T${score.segment}`;
    }

    if (
      score.multiplier === 2
    ) {

      return `D${score.segment}`;
    }

    return `${score.segment}`;
  }

  clearDarts(): void {

    this.pipeline.clear();
  }

  getDetectedDartsCount():
    number {

    return this.pipeline
      .detectedDarts()
      .length;
  }

  getScoredDartsCount():
    number {

    return this.pipeline
      .scoredDarts()
      .length;
  }

  getTotalScore():
    number {

    return this.pipeline
      .getTotalScore();
  }

  getLastScore():
    string {

    const last =
      this.pipeline
        .getLastThrow();

    if (!last) {
      return '-';
    }

    return this.formatSegment(
      last.score
    );
  }
  getBadgeText(
    score: DartScore
  ): string {

    if (
      score.segment === 0
    ) {

      return 'MISS';
    }

    if (
      score.segment === 25 &&
      score.multiplier === 2
    ) {

      return 'BULL';
    }

    if (
      score.segment === 25
    ) {

      return '25';
    }

    switch (
      score.multiplier
      ) {

      case 3:
        return `T${score.segment}`;

      case 2:
        return `D${score.segment}`;

      default:
        return `S${score.segment}`;
    }
  }
  getMissingThrows():
    number[] {

    const count =
      this.pipeline
        .scoredDarts()
        .length;

    return Array(
      Math.max(
        0,
        3 - count
      )
    ).fill(0);
  }

  readonly scoreboardPlayers =
    signal([
      {
        id: '1',
        name: 'Roger',
        remainingScore: 321,
        average: 67.33,
        checkout: 'T20 T19 D2',
        isCurrentPlayer: true,
      },
      {
        id: '2',
        name: 'Thomas',
        remainingScore: 501,
        average: 0,
        checkout: '-',
        isCurrentPlayer: false,
      },
    ]);
}
