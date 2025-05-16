import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DetalleSucursalComponent } from './pages/detalle-sucursal/detalle-sucursal.component';
import { FormularioVentaComponent } from './pages/formulario-venta/formulario-venta.component';
import { ListaProductoComponent } from './pages/lista-producto/lista-producto.component';

@NgModule({
  declarations: [
    AppComponent,
    DetalleSucursalComponent,
    FormularioVentaComponent,
    ListaProductoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
