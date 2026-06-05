import {
  Component,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CameraService } from '../../core/services/camera';
import { SettingsService } from '../../core/services/settings';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {

  readonly cameraService =
    inject(CameraService);

  readonly settingsService =
    inject(SettingsService);

  readonly cameras =
    this.cameraService.devices;

  readonly settings =
    this.settingsService.settings;

  readonly resolutions = [
    '640x480',
    '1280x720',
    '1920x1080',
  ];

  async ngOnInit(): Promise<void> {
    await this.cameraService.loadDevices();
  }

  onCameraChange(
    event: Event
  ): void {

    const value =
      (event.target as HTMLSelectElement)
        .value;

    this.settingsService.updateCamera(
      value
    );
  }

  onResolutionChange(
    event: Event
  ): void {

    const value =
      (event.target as HTMLSelectElement)
        .value as any;

    this.settingsService.updateResolution(
      value
    );
  }

  onDebugChange(
    event: Event
  ): void {

    const checked =
      (event.target as HTMLInputElement)
        .checked;

    this.settingsService.updateDebugMode(
      checked
    );
  }

  onSensitivityChange(
    event: Event
  ): void {

    const value =
      Number(
        (event.target as HTMLInputElement)
          .value
      );

    this.settingsService.updateSensitivity(
      value
    );
  }
}
