import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

type LoginResponse =
  | { ok: true; token: string; user: { email: string } }
  | { ok: false; message?: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = '/api';
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return this.token;
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  async login(email: string, password: string): Promise<{ ok: boolean; message?: string }> {
    try {
      const res = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password })
      );

      if (res.ok) {
        this.token = res.token;
        return { ok: true };
      }

      this.token = null;
      return { ok: false, message: res.message || 'Falha no login.' };
    } catch (e: any) {
      this.token = null;
      const msg = (e?.message && String(e.message).trim())
        ? e.message
        : 'Falha ao autenticar. Verifique servidor e tente novamente.';
      return { ok: false, message: msg };
    }
  }

  logout(): void {
    this.token = null;
  }
}
