import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormularioVentaComponent } from './pages/formulario-venta/formulario-venta.component';
import { ListaProductosComponent } from './pages/lista-producto/lista-producto.component';
import { BuscadorComponent } from './pages/buscador/buscador.component';
import { StockSucursalComponent } from './pages/stock-sucursal/stock-sucursal.component';
import { ListaSucursalesComponent } from './pages/lista-sucursales/lista-sucursales.component';
import { SelectorSucursalComponent } from './pages/selector-sucursal/selector-sucursal.component';
import { PaginaVentaComponent } from './pages/pagina-venta/pagina-venta.component';
import { DetalleProductoComponent } from './pages/detalle-producto/detalle-producto.component';

@NgModule({
  declarations: [ AppComponent,                
                  StockSucursalComponent,
                  SelectorSucursalComponent,
                  ],
  imports: [ BrowserModule, AppRoutingModule, ListaProductosComponent, BuscadorComponent, HttpClientModule, ListaSucursalesComponent, DetalleProductoComponent, FormularioVentaComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
