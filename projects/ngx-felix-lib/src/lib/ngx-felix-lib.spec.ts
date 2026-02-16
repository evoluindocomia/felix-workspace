import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxFelixLib } from './ngx-felix-lib';

describe('NgxFelixLib', () => {
  let component: NgxFelixLib;
  let fixture: ComponentFixture<NgxFelixLib>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxFelixLib]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxFelixLib);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
