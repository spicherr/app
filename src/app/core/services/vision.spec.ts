import { TestBed } from '@angular/core/testing';

import { Vision } from './vision';

describe('Vision', () => {
  let service: Vision;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Vision);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
