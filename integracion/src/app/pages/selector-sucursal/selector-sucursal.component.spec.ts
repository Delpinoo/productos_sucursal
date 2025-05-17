import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorSucursalComponent } from './selector-sucursal.component';

describe('SelectorSucursalComponent', () => {
  let component: SelectorSucursalComponent;
  let fixture: ComponentFixture<SelectorSucursalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectorSucursalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectorSucursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
