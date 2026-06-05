import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardOverlay } from './board-overlay';

describe('BoardOverlay', () => {
  let component: BoardOverlay;
  let fixture: ComponentFixture<BoardOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardOverlay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
