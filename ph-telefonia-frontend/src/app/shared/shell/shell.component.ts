import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services';
import { Router } from '@angular/router';
import { UserMenuComponent } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css'],
  imports: [RouterModule, UserMenuComponent, CommonModule]
})
export class ShellComponent {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  @Input() title = 'CRUD';
  theme: 'light' | 'dark' = (localStorage.getItem('theme') as any) || 'light';

  ngOnInit() {
    document.body.setAttribute('data-theme', this.theme);
  }

  hasAccess(roles: string[]) {
    return this.auth.hasAnyAccess(roles);
  }

  isOnlyConsultor(): boolean {
    const roles = this.auth.getUserRoles();
    return roles.length === 1 && roles[0] === 'consultor';
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    document.body.setAttribute('data-theme', this.theme);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
