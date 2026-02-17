import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AuthService } from './core/services';
import { authTokenInterceptor, httpErrorInterceptor } from './core/interceptors';

function initAuth(auth: AuthService) {
  return async () => await auth.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(withInterceptors([
      authTokenInterceptor,
      httpErrorInterceptor,
    ])),

    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [AuthService],
      multi: true,
    },
  ],
};
