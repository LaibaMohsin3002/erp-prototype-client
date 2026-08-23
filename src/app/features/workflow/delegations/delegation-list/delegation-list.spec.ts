import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelegationList } from './delegation-list';

describe('DelegationList', () => {
  let component: DelegationList;
  let fixture: ComponentFixture<DelegationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DelegationList],
    }).compileComponents();

    fixture = TestBed.createComponent(DelegationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
