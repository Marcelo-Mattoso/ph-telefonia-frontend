import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.waitForInitialization();

  if (auth.isLoggedIn()) {
    return true;
  }

  router.navigateByUrl('/login');
  return false;
};
