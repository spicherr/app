import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-cam',
  imports: [],
  templateUrl: './cam.html',
  styleUrl: './cam.scss',
})
export class Cam {

  @ViewChild('video')
  videoElement?: ElementRef<HTMLVideoElement>;

  cameraAvailable = false;

  async ngAfterViewInit() {
    await this.startCamera();
  }

  async startCamera() {

    this.cameraAvailable = true;

    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraAvailable = false;
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = stream;
      }

    } catch (error) {
      console.error('Kamera-Zugriff fehlgeschlagen:', error);
      this.cameraAvailable = false;
    }
  }
}
