import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaVentaComponent } from './pagina-venta.component';

describe('PaginaVentaComponent', () => {
  let component: PaginaVentaComponent;
  let fixture: ComponentFixture<PaginaVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaginaVentaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
