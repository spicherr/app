import {
  Injectable,
  computed,
  signal,
} from '@angular/core';

export interface Throw {

  playerId: string;

  score: number;

  timestamp: number;
}

export interface Player {

  id: string;

  name: string;

  score: number;

  legs: number;

  sets: number;

  throws: Throw[];
}

export interface GameConfig {

  startScore: 301 | 501;

  legsToWinSet: number;

  setsToWinMatch: number;

  players: string[];
}

export interface GameState {

  started: boolean;

  finished: boolean;

  currentPlayerIndex: number;

  legNumber: number;

  setNumber: number;
}

interface HistoryEntry {

  playerIndex: number;

  previousScore: number;

  throwData: Throw;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {

  readonly players =
    signal<Player[]>([]);

  readonly state =
    signal<GameState>({
      started: false,
      finished: false,
      currentPlayerIndex: 0,
      legNumber: 1,
      setNumber: 1,
    });

  private readonly history =
    signal<HistoryEntry[]>([]);

  readonly currentPlayer =
    computed(() => {

      const players =
        this.players();

      const index =
        this.state()
          .currentPlayerIndex;

      return players[index] ??
        null;
    });

  readonly winner =
    computed(() => {

      const config =
        this.config;

      if (!config) {
        return null;
      }

      return this.players()
        .find(
          p =>
            p.sets >=
            config.setsToWinMatch
        ) ?? null;
    });

  private config?:
    GameConfig;

  startGame(
    config: GameConfig
  ): void {

    this.config = config;

    const players =
      config.players.map(
        name => ({
          id:
            crypto.randomUUID(),

          name,

          score:
          config.startScore,

          legs: 0,

          sets: 0,

          throws: [],
        })
      );

    this.players.set(
      players
    );

    this.history.set([]);

    this.state.set({
      started: true,
      finished: false,
      currentPlayerIndex: 0,
      legNumber: 1,
      setNumber: 1,
    });
  }

  addThrow(
    score: number
  ): void {

    if (
      !this.config
    ) {
      return;
    }

    const state =
      this.state();

    if (
      state.finished
    ) {
      return;
    }

    const players =
      [...this.players()];

    const player =
      players[
        state.currentPlayerIndex
        ];

    const previousScore =
      player.score;

    const newScore =
      previousScore - score;

    /**
     * Bust
     */
    if (
      newScore < 0 ||
      newScore === 1
    ) {

      this.nextPlayer();

      return;
    }

    const throwData: Throw = {

      playerId:
      player.id,

      score,

      timestamp:
        Date.now(),
    };

    player.score =
      newScore;

    player.throws.push(
      throwData
    );

    this.history.update(
      history => [
        ...history,
        {
          playerIndex:
          state.currentPlayerIndex,

          previousScore,

          throwData,
        },
      ]
    );

    this.players.set(
      players
    );

    if (
      player.score === 0
    ) {

      this.finishLeg();

      return;
    }
  }

  undoThrow(): void {

    const history =
      [...this.history()];

    const last =
      history.pop();

    if (!last) {
      return;
    }

    const players =
      [...this.players()];

    const player =
      players[
        last.playerIndex
        ];

    player.score =
      last.previousScore;

    player.throws.pop();

    this.players.set(
      players
    );

    this.history.set(
      history
    );

    this.state.update(
      state => ({
        ...state,
        currentPlayerIndex:
        last.playerIndex,
      })
    );
  }

  nextPlayer(): void {

    const state =
      this.state();

    const players =
      this.players();

    const nextIndex =
      (
        state.currentPlayerIndex + 1
      ) %
      players.length;

    this.state.set({
      ...state,
      currentPlayerIndex:
      nextIndex,
    });
  }

  finishLeg(): void {

    if (
      !this.config
    ) {
      return;
    }

    const state =
      this.state();

    const players =
      [...this.players()];

    const winner =
      players[
        state.currentPlayerIndex
        ];

    winner.legs++;

    const legsToWinSet =
      this.config
        .legsToWinSet;

    if (
      winner.legs >=
      legsToWinSet
    ) {

      winner.sets++;

      players.forEach(
        player => {

          player.legs = 0;
        }
      );

      const setsToWinMatch =
        this.config
          .setsToWinMatch;

      if (
        winner.sets >=
        setsToWinMatch
      ) {

        this.players.set(
          players
        );

        this.state.set({
          ...state,
          finished: true,
        });

        return;
      }

      this.state.set({
        ...state,
        setNumber:
          state.setNumber + 1,
      });
    }

    const startScore =
      this.config
        .startScore;

    players.forEach(
      player => {

        player.score =
          startScore;

        player.throws = [];
      }
    );

    this.players.set(
      players
    );

    this.history.set([]);

    this.state.set({
      ...this.state(),
      legNumber:
        state.legNumber + 1,
      currentPlayerIndex: 0,
    });
  }

  getRemainingScore():
    number {

    return (
      this.currentPlayer()
        ?.score ?? 0
    );
  }

  getTotalThrows(
    playerId: string
  ): number {

    const player =
      this.players()
        .find(
          p =>
            p.id ===
            playerId
        );

    return (
      player?.throws
        .length ?? 0
    );
  }

  reset(): void {

    this.players.set([]);

    this.history.set([]);

    this.state.set({
      started: false,
      finished: false,
      currentPlayerIndex: 0,
      legNumber: 1,
      setNumber: 1,
    });

    this.config =
      undefined;
  }
}
