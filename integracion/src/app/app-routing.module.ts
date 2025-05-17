import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaProductosComponent } from './pages/lista-producto/lista-producto.component';
import { HttpClientModule } from '@angular/common/http';
import { PaginaVentaComponent } from './pages/pagina-venta/pagina-venta.component';

const routes: Routes = [

  {path: '', component: PaginaVentaComponent},
  {path: 'lista-producto', component: ListaProductosComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule ],
  exports: [RouterModule]
})
export class AppRoutingModule {}