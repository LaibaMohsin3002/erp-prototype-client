import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesList } from './pages-list';

describe('PagesList', () => {
  let component: PagesList;
  let fixture: ComponentFixture<PagesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagesList],
    }).compileComponents();

    fixture = TestBed.createComponent(PagesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
