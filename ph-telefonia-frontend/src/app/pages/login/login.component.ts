import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';

  // ✅ signal reativo
  error = signal<string>('');

  constructor(private auth: AuthService, private router: Router) {}

  clearError() {
    this.error.set('');
  }

  async submit() {
    this.error.set('');

    const result = await this.auth.login(this.username, this.password);

    if (result.ok) {
      this.router.navigateByUrl('/');
    } else {
      this.error.set(result.message || 'Falha no login.');
    }
  }
}
