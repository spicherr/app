import {
  Injectable,
  computed,
  signal,
} from '@angular/core';

import {
  AppSettings,
  ResolutionOption,
} from '../models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {

  private readonly _settings =
    signal<AppSettings>({
      cameraId: null,
      resolution: '1280x720',
      debugMode: true,
      detectionSensitivity: 50,
    });

  readonly settings =
    computed(() => this._settings());

  updateCamera(
    cameraId: string
  ): void {
    this._settings.update(state => ({
      ...state,
      cameraId,
    }));
  }

  updateResolution(
    resolution: ResolutionOption
  ): void {
    this._settings.update(state => ({
      ...state,
      resolution,
    }));
  }

  updateDebugMode(
    enabled: boolean
  ): void {
    this._settings.update(state => ({
      ...state,
      debugMode: enabled,
    }));
  }

  updateSensitivity(
    sensitivity: number
  ): void {
    this._settings.update(state => ({
      ...state,
      detectionSensitivity: sensitivity,
    }));
  }

  reset(): void {
    this._settings.set({
      cameraId: null,
      resolution: '1280x720',
      debugMode: true,
      detectionSensitivity: 50,
      boardCenterX: undefined,
      boardCenterY: undefined,
      boardRadius: undefined,
    });
  }

  updateBoardCalibration(
    centerX: number,
    centerY: number,
    radius: number
  ): void {

    this._settings.update(
      state => ({

        ...state,

        boardCenterX:
        centerX,

        boardCenterY:
        centerY,

        boardRadius:
        radius,
      })
    );
  }

}
