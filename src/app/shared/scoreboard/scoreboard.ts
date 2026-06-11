import {
  Component,
  computed,
  input,
} from '@angular/core';

import { CommonModule } from '@angular/common';

export interface ScoreboardPlayer {

  id: string;

  name: string;

  remainingScore: number;

  average: number;

  checkout: string;

  isCurrentPlayer: boolean;
}

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.scss',
})
export class Scoreboard {

  readonly players =
    input.required<
      ScoreboardPlayer[]
    >();

  readonly currentPlayer =
    computed(
      () =>
        this.players()
          .find(
            player =>
              player.isCurrentPlayer
          ) ?? null
    );
}
