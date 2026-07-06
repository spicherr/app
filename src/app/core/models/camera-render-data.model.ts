
import {DetectedBoard} from './dart-board.model';
import {Dart} from './dart.model';

export interface CameraRenderData {

  ctx: CanvasRenderingContext2D;

  canvas: HTMLCanvasElement;

  video: HTMLVideoElement;

  board: DetectedBoard | null;

  darts: Dart[];

  debug: boolean;

  showGrid: boolean;
}
