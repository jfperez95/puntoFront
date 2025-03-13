import { Routes } from '@angular/router';
import path from 'path';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';

export const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'main', component: MainComponent}
];
