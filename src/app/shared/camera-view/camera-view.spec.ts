import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraView } from './camera-view';

describe('CameraView', () => {
  let component: CameraView;
  let fixture: ComponentFixture<CameraView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
