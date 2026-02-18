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

    // Se o usuário SOMENTE TEM uma das roles proibidas, bloqueia
    const userAccess = auth.getUserRoles();
    if (userAccess.length === 1 && forbidden.includes(userAccess[0])) {
      router.navigateByUrl('/');
      return false;
    }

    // Caso contrário, permite acesso
    return true;
  };
};
