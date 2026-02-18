import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { CrudListComponent } from './pages/crud-list/crud-list.component';
import { CreateOrderComponent } from './pages/create-order/create-order.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard, roleGuard, notRoleGuard } from './core/guards';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', canActivate: [authGuard], component: HomeComponent },
  { path: '', canActivate: [authGuard], component: CrudListComponent },
  { path: 'order', canActivate: [authGuard, notRoleGuard(['consultor'])], component: CrudListComponent },
  { path: 'create-order', canActivate: [authGuard], component: CreateOrderComponent },
  { path: '**', redirectTo: 'login' },
];
