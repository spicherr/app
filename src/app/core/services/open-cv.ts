import {
  Injectable,
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
  readonly ready = signal(false);

  readonly loading = signal(false);

  readonly error =
    signal<string | null>(null);

  async initialize(): Promise<void> {
    if (this.ready()) {
      return;
    }

    try {
      this.loading.set(true);

      await this.loadScript();

      await this.waitForCv();

      this.ready.set(true);
    } catch (error) {
      console.error(error);

      this.error.set(
        'OpenCV konnte nicht geladen werden'
      );
    } finally {
      this.loading.set(false);
    }
  }

  private loadScript(): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        if (window.cv) {
          resolve();
          return;
        }

        const existing =
          document.querySelector(
            '#opencv-script'
          );

        if (existing) {
          resolve();
          return;
        }

        const script =
          document.createElement('script');

        script.id = 'opencv-script';

        script.src =
          'https://docs.opencv.org/4.x/opencv.js';

        script.async = true;

        script.onload = () =>
          resolve();

        script.onerror = () =>
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

  private waitForCv(): Promise<void> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          window.cv &&
          typeof window.cv.Mat !==
          'undefined'
        ) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }
}
