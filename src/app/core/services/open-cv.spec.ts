import { TestBed } from '@angular/core/testing';

import { OpenCv } from './open-cv';

describe('OpenCv', () => {
  let service: OpenCv;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenCv);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
