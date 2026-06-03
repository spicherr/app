import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';

declare var cv: any;

@Component({
  selector: 'app-dart-detector',
  templateUrl: './dart-detector.html',
  styleUrls: ['./dart-detector.scss'],
})
export class DartDetector implements AfterViewInit {
  @ViewChild('video', { static: true })
  videoRef!: ElementRef<HTMLVideoElement>;

  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  video!: HTMLVideoElement;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;

  previousFrame: any = null;

  warpedSize = 800;

  async ngAfterViewInit(): Promise<void> {
    this.video = this.videoRef.nativeElement;
    this.canvas = this.canvasRef.nativeElement;

    const context = this.canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas context konnte nicht erstellt werden');
    }

    this.ctx = context;

    await this.startCamera();

    this.waitForOpenCV();
  }

  async startCamera(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 1280,
        height: 720,
        facingMode: 'environment',
      },
      audio: false,
    });

    this.video.srcObject = stream;

    return new Promise((resolve) => {
      this.video.onloadedmetadata = () => {
        this.video.play();
        resolve();
      };
    });
  }

  waitForOpenCV(): void {
    const interval = setInterval(() => {
      if (typeof cv !== 'undefined') {
        clearInterval(interval);
        this.processLoop();
      }
    }, 100);
  }

  processLoop(): void {
    const process = () => {
      this.detectBoardAndDarts();
      requestAnimationFrame(process);
    };

    process();
  }

  detectBoardAndDarts(): void {
    this.ctx.drawImage(
      this.video,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    const src = cv.imread(this.canvas);

    const gray = new cv.Mat();

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    cv.GaussianBlur(
      gray,
      gray,
      new cv.Size(9, 9),
      2,
      2
    );

    const circles = new cv.Mat();

    cv.HoughCircles(
      gray,
      circles,
      cv.HOUGH_GRADIENT,
      1,
      100,
      120,
      40,
      200,
      500
    );

    if (circles.cols > 0) {
      const data = circles.data32F;

      const x = data[0];
      const y = data[1];
      const radius = data[2];

      cv.circle(
        src,
        new cv.Point(x, y),
        radius,
        [0, 255, 0, 255],
        3
      );

      const warped = this.extractBoard(
        src,
        x,
        y,
        radius
      );

      if (warped) {
        this.detectDart(warped);
      }
    }

    cv.imshow(this.canvas, src);

    src.delete();
    gray.delete();
    circles.delete();
  }

  extractBoard(
    src: any,
    x: number,
    y: number,
    radius: number
  ): any {
    try {
      const padding = radius * 1.1;

      const left = Math.max(
        0,
        Math.floor(x - padding)
      );

      const top = Math.max(
        0,
        Math.floor(y - padding)
      );

      const size = Math.floor(
        Math.min(
          padding * 2,
          src.cols - left,
          src.rows - top
        )
      );

      const rect = new cv.Rect(
        left,
        top,
        size,
        size
      );

      const roi = src.roi(rect);

      const warped = new cv.Mat();

      cv.resize(
        roi,
        warped,
        new cv.Size(
          this.warpedSize,
          this.warpedSize
        )
      );

      roi.delete();

      return warped;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  detectDart(frame: any): void {
    const gray = new cv.Mat();

    cv.cvtColor(
      frame,
      gray,
      cv.COLOR_RGBA2GRAY
    );

    cv.GaussianBlur(
      gray,
      gray,
      new cv.Size(5, 5),
      0
    );

    if (!this.previousFrame) {
      this.previousFrame = gray.clone();
      gray.delete();
      return;
    }

    const diff = new cv.Mat();

    cv.absdiff(
      this.previousFrame,
      gray,
      diff
    );

    const thresh = new cv.Mat();

    cv.threshold(
      diff,
      thresh,
      30,
      255,
      cv.THRESH_BINARY
    );

    const kernel = cv.Mat.ones(
      3,
      3,
      cv.CV_8U
    );

    cv.morphologyEx(
      thresh,
      thresh,
      cv.MORPH_OPEN,
      kernel
    );

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    cv.findContours(
      thresh,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);

      const area = cv.contourArea(contour);

      if (area < 150) {
        continue;
      }

      const rect = cv.boundingRect(contour);

      const centerX =
        rect.x + rect.width / 2;

      const centerY =
        rect.y + rect.height / 2;

      const score = this.calculateScore(
        centerX,
        centerY
      );

      console.log('TREFFER:', score);

      cv.rectangle(
        frame,
        new cv.Point(rect.x, rect.y),
        new cv.Point(
          rect.x + rect.width,
          rect.y + rect.height
        ),
        [255, 0, 0, 255],
        2
      );
    }

    cv.imshow(this.canvas, frame);

    this.previousFrame.delete();
    this.previousFrame = gray.clone();

    gray.delete();
    diff.delete();
    thresh.delete();
    contours.delete();
    hierarchy.delete();
    kernel.delete();
    frame.delete();
  }

  calculateScore(
    x: number,
    y: number
  ): string | number {
    const center = this.warpedSize / 2;

    const dx = x - center;
    const dy = y - center;

    const radius = Math.sqrt(
      dx * dx + dy * dy
    );

    let angle = Math.atan2(dy, dx);

    angle = angle * (180 / Math.PI);

    angle += 90;

    if (angle < 0) {
      angle += 360;
    }

    const segments = [
      20, 1, 18, 4, 13,
      6, 10, 15, 2, 17,
      3, 19, 7, 16, 8,
      11, 14, 9, 12, 5,
    ];

    const segmentIndex =
      Math.floor(angle / 18) % 20;

    let value = segments[segmentIndex];

    if (radius < 15) {
      return 'Bullseye 50';
    }

    if (radius < 35) {
      return 'Bull 25';
    }

    if (radius > 300 && radius < 340) {
      value *= 2;
    }

    if (radius > 180 && radius < 220) {
      value *= 3;
    }

    if (radius > 390) {
      return 'Miss';
    }

    return value;
  }
}
