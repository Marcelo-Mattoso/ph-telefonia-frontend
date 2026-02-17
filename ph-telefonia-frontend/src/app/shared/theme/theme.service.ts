import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  dark = false;

  constructor() {
    // tenta carregar preferência (sem quebrar em SSR)
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('theme');
      this.dark = saved === 'dark';
      this.apply();
    }
  }

  apply() {
    const mode = this.dark ? 'dark' : 'light';

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', mode);
    }
  }
}
