import { TestBed } from '@angular/core/testing';

import { CameraRenderer } from './camera-renderer';

describe('CameraRenderer', () => {
  let service: CameraRenderer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CameraRenderer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
