import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const notRoleGuard = (forbidden: string[]): CanActivateFn => {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.waitForInitialization();

    if (!auth.isLoggedIn()) {
      router.navigateByUrl('/login');
      return false;
    }

    // Se o usuário tem alguma das roles proibidas, bloqueia
    if (auth.hasAnyAccess(forbidden)) {
      router.navigateByUrl('/');
      return false;
    }

    // Caso contrário, permite acesso
    return true;
  };
};
