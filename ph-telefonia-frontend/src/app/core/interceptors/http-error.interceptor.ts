import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

function mapHttpError(err: HttpErrorResponse, isLogin: boolean): string {
  // 0 costuma ser CORS / servidor offline / DNS / network
  if (err.status === 0) return 'Sem conexão com o servidor. Verifique rede/URL.';

  switch (err.status) {
    case 400: return 'Requisição inválida.';
    case 401: return isLogin ? 'E-mail ou senha inválidos.' : 'Sessão expirada. Faça login novamente.';
    case 403: return isLogin ? 'Acesso negado.' : 'Sessão expirada. Faça login novamente.';
    case 404: return isLogin ? 'Serviço de autenticação não encontrado.' : 'Recurso não encontrado.';
    case 409: return 'Conflito na requisição.';
    case 422: return 'Dados inválidos.';
    case 429: return 'Muitas tentativas. Aguarde e tente novamente.';
    case 500: return 'Erro interno do servidor.';
    case 503: return 'Serviço indisponível no momento.';
    default:  return `Erro inesperado (${err.status}).`;
  }
}

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isLogin = req.url.includes('/api/auth/login');

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        // ✅ se token expirou no backend: derruba e manda pro login
        if (!isLogin && (err.status === 401 || err.status === 403)) {
          auth.logout();
          if (router.url !== '/login') router.navigateByUrl('/login');
        }

        const message = mapHttpError(err, isLogin);

        // mantém seu padrão de erro "limpo"
        return throwError(() => ({ status: err.status, message }));
      }

      return throwError(() => ({ status: -1, message: 'Erro desconhecido.' }));
    })
  );
};
