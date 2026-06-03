import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DartDetector } from './dart-detector';

describe('DartDetector', () => {
  let component: DartDetector;
  let fixture: ComponentFixture<DartDetector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DartDetector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DartDetector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
