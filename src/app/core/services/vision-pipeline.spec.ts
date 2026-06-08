import { TestBed } from '@angular/core/testing';

import { VisionPipeline } from './vision-pipeline';

describe('VisionPipeline', () => {
  let service: VisionPipeline;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisionPipeline);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
