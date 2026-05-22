import {ApplicationConfig, Component, signal} from '@angular/core';
import {provideRouter, RouterOutlet} from '@angular/router';
import {Header} from './header/header';
import {Cam} from './cam/cam';
import {Footer} from './footer/footer';
import {routes} from './app.routes';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header,Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('app');
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
  ],
};
