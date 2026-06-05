import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThrowHistory } from './throw-history';

describe('ThrowHistory', () => {
  let component: ThrowHistory;
  let fixture: ComponentFixture<ThrowHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThrowHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThrowHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
