import { TestBed } from '@angular/core/testing';

import { BoardDetection } from './board-detection';

describe('BoardDetection', () => {
  let service: BoardDetection;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardDetection);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
