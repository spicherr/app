import { Component } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {Game} from '../features/game/game';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatButtonModule,Game],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

}
