import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickSetup } from './quick-setup';

describe('QuickSetup', () => {
  let component: QuickSetup;
  let fixture: ComponentFixture<QuickSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickSetup],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickSetup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
