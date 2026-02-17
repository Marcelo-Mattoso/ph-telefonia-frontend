import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { CrudListComponent } from './pages/crud-list/crud-list.component';
import { authGuard } from './core/guards';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', canActivate: [authGuard], component: CrudListComponent },
  { path: '**', redirectTo: 'login' },
];
