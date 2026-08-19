import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoCreate } from './po-create';

describe('PoCreate', () => {
  let component: PoCreate;
  let fixture: ComponentFixture<PoCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(PoCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
