import { Component, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services';
import { ThemeService } from '../theme/theme.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.css'],
})
export class UserMenuComponent {
  open = signal(false);

  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    private router: Router
  ) {}

  toggleMenu(ev: MouseEvent) {
    ev.stopPropagation();
    this.open.set(!this.open());
  }

  close() {
    this.open.set(false);
  }

  @HostListener('document:click')
  onDocClick() {
    this.close();
  }

  get name(): string {
    return this.auth.getDisplayName();
  }

  get email(): string {
    return this.auth.getEmail();
  }

  get photoUrl(): string {
    return this.auth.getPhotoUrl();
  }

  get initials(): string {
    const base = (this.name || 'U').trim().split(/\s+/);
    const a = base[0]?.[0] ?? 'U';
    const b = base.length > 1 ? (base[base.length - 1]?.[0] ?? '') : '';
    return (a + b).toUpperCase();
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
