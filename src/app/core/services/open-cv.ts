import {
  Injectable,
  computed,
  signal,
} from '@angular/core';

declare global {
  interface Window {
    cv: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class OpenCvService {

  readonly ready =
    signal(false);

  readonly loading =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly initialized =
    computed(() =>
      this.ready() &&
      !this.loading() &&
      !this.error()
    );

  private initializationPromise?:
    Promise<void>;

  async initialize(): Promise<void> {

    if (this.ready()) {
      return;
    }

    if (
      this.initializationPromise
    ) {
      return this.initializationPromise;
    }

    this.initializationPromise =
      this.initializeInternal();

    return this.initializationPromise;
  }

  private async initializeInternal():
    Promise<void> {

    try {

      this.loading.set(true);
      this.error.set(null);

      await this.loadScript();

      await this.waitForRuntime();

      this.ready.set(true);

      console.info(
        'OpenCV bereit'
      );

    } catch (error) {

      console.error(error);

      this.error.set(
        'OpenCV konnte nicht geladen werden'
      );

      throw error;

    } finally {

      this.loading.set(false);
    }
  }

  private loadScript():
    Promise<void> {

    return new Promise(
      (resolve, reject) => {

        if (
          window.cv &&
          typeof window.cv
            .getBuildInformation ===
          'function'
        ) {

          resolve();
          return;
        }

        const existing =
          document.getElementById(
            'opencv-script'
          );

        if (existing) {

          const interval =
            setInterval(() => {

              if (
                window.cv
              ) {

                clearInterval(
                  interval
                );

                resolve();
              }

            }, 100);

          return;
        }

        const script =
          document.createElement(
            'script'
          );

        script.id =
          'opencv-script';

        script.async = true;

        script.src =
          'https://docs.opencv.org/4.x/opencv.js';

        script.onload =
          () => resolve();

        script.onerror =
          () =>
            reject(
              new Error(
                'OpenCV Script konnte nicht geladen werden'
              )
            );

        document.body.appendChild(
          script
        );
      }
    );
  }

  private waitForRuntime():
    Promise<void> {

    return new Promise(
      (resolve, reject) => {

        const timeout =
          window.setTimeout(
            () => {

              reject(
                new Error(
                  'OpenCV Runtime Timeout'
                )
              );

            },
            30000
          );

        const check =
          () => {

            if (!window.cv) {

              setTimeout(
                check,
                100
              );

              return;
            }

            try {

              if (
                typeof window.cv
                  .getBuildInformation ===
                'function'
              ) {

                clearTimeout(
                  timeout
                );

                resolve();

                return;
              }

            } catch {
              // Runtime noch nicht bereit
            }

            setTimeout(
              check,
              100
            );
          };

        check();
      }
    );
  }

  isReady(): boolean {

    return (
      this.ready() &&
      typeof window.cv !==
      'undefined'
    );
  }

  getCv(): any {

    if (!this.isReady()) {

      throw new Error(
        'OpenCV ist noch nicht initialisiert'
      );
    }

    return window.cv;
  }
}
