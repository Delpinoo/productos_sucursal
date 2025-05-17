import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockSucursalComponent } from './stock-sucursal.component';

describe('StockSucursalComponent', () => {
  let component: StockSucursalComponent;
  let fixture: ComponentFixture<StockSucursalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockSucursalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockSucursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
