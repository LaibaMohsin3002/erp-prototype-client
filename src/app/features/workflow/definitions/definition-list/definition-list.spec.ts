import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefinitionList } from './definition-list';

describe('DefinitionList', () => {
  let component: DefinitionList;
  let fixture: ComponentFixture<DefinitionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefinitionList],
    }).compileComponents();

    fixture = TestBed.createComponent(DefinitionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
