export interface AppSettings {
  cameraId: string | null;

  resolution: ResolutionOption;

  debugMode: boolean;

  detectionSensitivity: number;
}

export type ResolutionOption =
  | '640x480'
  | '1280x720'
  | '1920x1080';
