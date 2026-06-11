import {
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';

import { SettingsService } from './settings';

export interface CameraDevice {
  id: string;
  label: string;
}

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  readonly videoReady =
    signal(false);
  private readonly settingsService =
    inject(SettingsService);

  private videoElement?: HTMLVideoElement;

  readonly stream =
    signal<MediaStream | null>(null);

  readonly devices =
    signal<CameraDevice[]>([]);

  readonly activeDeviceId =
    signal<string | null>(null);

  readonly loading =
    signal(false);

  readonly error =
    signal<string | null>(null);

  readonly running = computed(
    () => this.stream() !== null
  );

  registerVideoElement(
    video: HTMLVideoElement
  ): void {

    this.videoElement =
      video;

    this.videoReady.set(
      false
    );

    video.onloadeddata =
      () => {

        console.log(
          'Video bereit:',
          video.videoWidth,
          video.videoHeight
        );

        this.videoReady.set(
          true
        );
      };
  }

  getVideoElement():
    | HTMLVideoElement
    | undefined {
    return this.videoElement;
  }

  async loadDevices(): Promise<void> {

    try {

      const devices =
        await navigator.mediaDevices.enumerateDevices();

      const cameras = devices
        .filter(
          d => d.kind === 'videoinput'
        )
        .map(d => ({
          id: d.deviceId,
          label:
            d.label ||
            `Camera ${d.deviceId}`,
        }));

      this.devices.set(cameras);

    } catch (error) {

      console.error(error);

      this.error.set(
        'Kameras konnten nicht geladen werden'
      );
    }
  }

  async start(
    deviceId?: string
  ): Promise<void> {

    try {

      this.loading.set(true);
      this.error.set(null);

      this.stop();

      const settings =
        this.settingsService.settings();

      const selectedCamera =
        deviceId ??
        settings.cameraId ??
        undefined;

      const [width, height] =
        settings.resolution
          .split('x')
          .map(Number);

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedCamera
              ? {
                exact: selectedCamera,
              }
              : undefined,

            width: {
              ideal: width,
            },

            height: {
              ideal: height,
            },

            facingMode:
              'environment',
          },
          audio: false,
        });

      this.stream.set(stream);
      if (
        this.videoElement
      ) {

        this.videoReady.set(
          false
        );

        this.videoElement.srcObject =
          stream;

        await this.videoElement.play();

        await new Promise<void>(
          resolve => {

            const check =
              () => {

                if (
                  this.videoElement &&
                  this.videoElement.videoWidth > 0 &&
                  this.videoElement.videoHeight > 0
                ) {

                  this.videoReady.set(
                    true
                  );

                  resolve();

                  return;
                }

                requestAnimationFrame(
                  check
                );
              };

            check();
          }
        );
      }
      const track =
        stream.getVideoTracks()[0];

      const trackSettings =
        track.getSettings();

      if (
        trackSettings.deviceId
      ) {
        this.activeDeviceId.set(
          trackSettings.deviceId
        );
      }

      await this.loadDevices();

    } catch (error) {

      console.error(error);

      this.error.set(
        'Kamera konnte nicht gestartet werden'
      );

    } finally {

      this.loading.set(false);
    }
  }

  stop(): void {

    const current =
      this.stream();

    if (current) {

      current
        .getTracks()
        .forEach(track =>
          track.stop()
        );
    }

    if (
      this.videoElement
    ) {

      this.videoElement.pause();

      this.videoElement.srcObject =
        null;
    }

    this.stream.set(
      null
    );

    this.videoReady.set(
      false
    );
  }

  async restart(): Promise<void> {
    await this.start();
  }

  async switchCamera(
    deviceId: string
  ): Promise<void> {

    this.settingsService.updateCamera(
      deviceId
    );

    await this.start(deviceId);
  }

  captureFrame(
    video: HTMLVideoElement
  ): ImageData | null {

    if (!video.videoWidth) {
      return null;
    }

    const canvas =
      document.createElement('canvas');

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const ctx =
      canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  captureCurrentFrame():
    | ImageData
    | null {

    if (!this.videoElement) {
      return null;
    }

    return this.captureFrame(
      this.videoElement
    );
  }

  getVideoSize():
    | {
    width: number;
    height: number;
  }
    | null {

    if (
      !this.videoElement ||
      !this.videoElement.videoWidth
    ) {
      return null;
    }

    return {
      width:
      this.videoElement.videoWidth,

      height:
      this.videoElement.videoHeight,
    };
  }
}
