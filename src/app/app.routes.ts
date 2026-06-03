import {Routes} from '@angular/router';
import {Game} from './features/game/game';
import {Calibration} from './features/calibration/calibration';
import {Settings} from './features/settings/settings';
import {DartDetector} from './dart-detector/dart-detector';
import {CameraView} from './shared/camera-view/camera-view';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dart',
    pathMatch: 'full',
  },
  {
    path: 'dart',
    component: DartDetector
  },
  {
    path: 'tst',
    component: CameraView
  },
  {
    path: 'game',
    component: Game
  },
  {
    path: 'calibration',
    component: Calibration
  },
  {
    path: 'settings',
    component: Settings
  },
];
