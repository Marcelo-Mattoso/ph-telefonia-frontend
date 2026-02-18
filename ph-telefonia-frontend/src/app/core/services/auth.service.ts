import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

type LoginResponse =
  | { ok: true; token: string; user: { email: string; name?: string; photoUrl?: string; roles?: string[] }; expiresInSeconds: number }
  | { ok: false; message?: string }

type AuthUser = { email: string; name?: string; photoUrl?: string; roles?: string[] }

type StoredSession = {
  token: string;
  user: AuthUser;
  expiresAtMs: number;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = '/api';

  private readonly sessionKey = 'session';
  private readonly ttlMs = 30 * 60 * 1000;

  private token: string | null = null;
  private user: AuthUser | null = null;
  private expiresAtMs: number | null = null;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Signal para indicar quando a inicialização foi completada
  private initializationDone = signal(false);

  constructor(private http: HttpClient) {
    this.restoreFromStorage();
    if (this.token && this.isExpired()) {
      this.logout();
    }
  }

  async init(): Promise<void> {
    this.restoreFromStorage();
    if (this.token && this.isExpired()) {
      this.logout();
      this.initializationDone.set(true);
      return;
    }
    if (this.token) {
      await this.validateTokenWithBackend();
    }
    this.initializationDone.set(true);
  }

  isInitialized(): boolean {
    return this.initializationDone();
  }

  waitForInitialization(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.initializationDone()) {
        resolve(true);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(true);
      }, 5000);

      const unsubscribe = setInterval(() => {
        if (this.initializationDone()) {
          clearTimeout(timeout);
          clearInterval(unsubscribe);
          resolve(true);
        }
      }, 100);
    });
  }

  private async validateTokenWithBackend(): Promise<void> {
    try {
      await firstValueFrom(this.http.get(`${this.baseUrl}/auth/me`));
    } catch (e: any) {
      if (e?.status === 401) {
        this.logout();
      }
    }
  }

  getToken(): string | null {
    if (!this.token) return null;
    if (this.isExpired()) {
      this.logout();
      return null;
    }
    return this.token;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getEmail(): string {
    return this.user?.email ?? '';
  }

  getDisplayName(): string {
    const email = this.user?.email ?? '';
    const fallback = email ? email.split('@')[0] : 'Usuário';
    return this.user?.name?.trim() || fallback;
  }

  getPhotoUrl(): string {
    return this.user?.photoUrl ?? '';
  }

  getRemainingMs(): number {
    if (!this.expiresAtMs) return 0;
    return Math.max(0, this.expiresAtMs - Date.now());
  }

  getUserRoles(): string[] {
    return Array.isArray(this.user?.roles) ? this.user!.roles : [];
  }

  hasAnyAccess(required: string[]): boolean {
    if (!this.user?.roles || !Array.isArray(this.user.roles)) return false;
    return required.some((r) => this.user!.roles!.includes(r));
  }

  async login(email: string, password: string): Promise<{ ok: boolean; message?: string }> {
    try {
      const res = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password })
      );

      if (!res.ok) {
        this.logout();
        return { ok: false, message: res.message || 'Usuário não tem permissão de acesso.' };
      }

      this.token = res.token;
      this.user = res.user as AuthUser;
      this.expiresAtMs = Date.now() + res.expiresInSeconds * 1000;

      this.saveToStorage();

      return { ok: true };
    } catch (e: any) {
      this.logout();
      if (e?.status === 403) {
        return { ok: false, message: 'Usuário não tem permissão de acesso.' };
      }

      const msg = (e?.message && String(e.message).trim())
        ? e.message
        : 'Falha ao autenticar. Verifique servidor e tente novamente.';
      return { ok: false, message: msg };
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    this.expiresAtMs = null;
    this.clearStorage();
  }

  // ===== storage helpers =====

  private storage(): Storage | null {
    if (!this.isBrowser) return null;
    return window.localStorage;
  }

  private saveToStorage() {
    const st = this.storage();
    if (!st || !this.token || !this.user || !this.expiresAtMs) return;

    const payload: StoredSession = {
      token: this.token,
      user: this.user,
      expiresAtMs: this.expiresAtMs,
    };

    st.setItem(this.sessionKey, JSON.stringify(payload));
  }

  private restoreFromStorage() {
    const st = this.storage();
    if (!st) return;

    const raw = st.getItem(this.sessionKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as StoredSession;
      if (!parsed?.token || !parsed?.expiresAtMs) return;

      this.token = parsed.token;
      this.user = parsed.user ?? null;
      this.expiresAtMs = parsed.expiresAtMs;
    } catch {
      this.clearStorage();
    }
  }

  private clearStorage() {
    const st = this.storage();
    if (!st) return;
    st.removeItem(this.sessionKey);
  }

  private isExpired(): boolean {
    if (!this.expiresAtMs) return true;
    return Date.now() > this.expiresAtMs;
  }

  private getJwtExpiryMs(token: string): number | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
      const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);
      if (!payload?.exp) return null;
      return Number(payload.exp) * 1000;
    } catch {
      return null;
    }
  }
}
