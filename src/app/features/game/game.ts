import {Component, inject, signal} from '@angular/core';
import {CameraView} from '../../shared/camera-view/camera-view';
import {BoardOverlay} from '../../shared/board-overlay/board-overlay';
import {BoardDetectionService} from '../../core/services/board-detection';
import {Dart} from '../../core/models/dart.model';



@Component({
  selector: 'app-game',
  imports: [CameraView, BoardOverlay],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class Game {
  readonly boardDetection =
    inject(BoardDetectionService);

  readonly detectedDarts =
    signal<Dart[]>([]);
}
