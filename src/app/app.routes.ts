import {Routes} from '@angular/router';
import {Game} from './features/game/game';
import {Calibration} from './features/calibration/calibration';
import {Settings} from './features/settings/settings';
import {Dashboard} from './dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: Game
  },
  {
    path: 'game',
    component: Game
  },
  {
    path: 'dashboard',
    component: Dashboard
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
