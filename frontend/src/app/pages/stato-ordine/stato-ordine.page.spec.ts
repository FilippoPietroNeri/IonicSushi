import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatoOrdinePage } from './stato-ordine.page';

describe('StatoOrdinePage', () => {
  let component: StatoOrdinePage;
  let fixture: ComponentFixture<StatoOrdinePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StatoOrdinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
