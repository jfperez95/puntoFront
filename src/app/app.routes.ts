import { Routes } from '@angular/router';
import path from 'path';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { LayoutComponent } from './layout/layout.component';
import { FormularioComponent } from './formulario/formulario.component';

export const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: '', component:LayoutComponent, children: [
    {path: 'main', component: MainComponent, pathMatch: 'full'},
    {path: 'formulario', component: FormularioComponent}
  ]},
  {path: '**', component: LoginComponent}
];
