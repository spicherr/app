import {
  Injectable,
  signal,
} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DebugService {

  readonly enabled =
    signal(false);

  log(
    component: string,
    message: string,
    ...data: unknown[]
  ): void {

    if (
      !this.enabled()
    ) {
      return;
    }

    console.log(
      `[${component}] ${message}`,
      ...data
    );

  }

}
