import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard = (required: string[]): CanActivateFn => {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.waitForInitialization();

    if (!auth.isLoggedIn()) {
      router.navigateByUrl('/login');
      return false;
    }

    if (auth.hasAnyAccess(required)) {
      return true;
    }

    // not allowed: redirect to home
    router.navigateByUrl('/');
    return false;
  };
};
