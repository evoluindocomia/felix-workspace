import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelloMfe } from './hello-mfe';

describe('HelloMfe', () => {
  let component: HelloMfe;
  let fixture: ComponentFixture<HelloMfe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelloMfe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelloMfe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
