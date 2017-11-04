import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebglSceneComponent } from './webgl-scene.component';

describe('WebglSceneComponent', () => {
  let component: WebglSceneComponent;
  let fixture: ComponentFixture<WebglSceneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebglSceneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebglSceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
