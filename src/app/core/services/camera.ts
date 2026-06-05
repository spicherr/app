import {
  Injectable,
  computed,
  signal,
} from '@angular/core';

export interface CameraDevice {
  id: string;
  label: string;
}

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  readonly stream = signal<MediaStream | null>(null);

  readonly devices = signal<CameraDevice[]>([]);

  readonly activeDeviceId = signal<string | null>(null);

  readonly loading = signal(false);

  readonly error = signal<string | null>(null);

  readonly running = computed(
    () => this.stream() !== null
  );

  async loadDevices(): Promise<void> {
    try {
      const devices =
        await navigator.mediaDevices.enumerateDevices();

      const cameras = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d) => ({
          id: d.deviceId,
          label:
            d.label || `Camera ${d.deviceId}`,
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

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: deviceId
              ? { exact: deviceId }
              : undefined,

            width: {
              ideal: 1920,
            },

            height: {
              ideal: 1080,
            },

            facingMode: 'environment',
          },

          audio: false,
        });

      this.stream.set(stream);

      const track =
        stream.getVideoTracks()[0];

      const settings =
        track.getSettings();

      if (settings.deviceId) {
        this.activeDeviceId.set(
          settings.deviceId
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
    const current = this.stream();

    if (!current) {
      return;
    }

    current
      .getTracks()
      .forEach((track) => track.stop());

    this.stream.set(null);
  }

  async switchCamera(
    deviceId: string
  ): Promise<void> {
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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

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
}
