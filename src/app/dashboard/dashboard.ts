import {
  Component,
  inject,
} from '@angular/core';

import {
  Router,
  RouterLink,
} from '@angular/router';

import {
  MatButtonModule,
} from '@angular/material/button';

import {
  GameService,
} from '../core/services/game';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

  private readonly router =
    inject(Router);

  private readonly gameService =
    inject(GameService);

  start501(): void {

    this.gameService.startGame({

      startScore: 501,

      legsToWinSet: 3,

      setsToWinMatch: 3,

      players: [
        'Spieler 1',
        'Spieler 2',
      ],
    });

    this.router.navigate([
      '/game',
    ]);
  }

  start301(): void {

    this.gameService.startGame({

      startScore: 301,

      legsToWinSet: 3,

      setsToWinMatch: 3,

      players: [
        'Spieler 1',
        'Spieler 2',
      ],
    });

    this.router.navigate([
      '/game',
    ]);
  }
}
