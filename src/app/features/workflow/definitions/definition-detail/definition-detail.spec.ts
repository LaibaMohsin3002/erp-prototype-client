import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefinitionDetail } from './definition-detail';

describe('DefinitionDetail', () => {
  let component: DefinitionDetail;
  let fixture: ComponentFixture<DefinitionDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefinitionDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(DefinitionDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
