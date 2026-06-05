import { TestBed } from '@angular/core/testing';

import { DartDetection } from './dart-detection';

describe('DartDetection', () => {
  let service: DartDetection;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DartDetection);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
