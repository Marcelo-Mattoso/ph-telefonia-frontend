import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

function mapHttpError(err: HttpErrorResponse): string {
  // 0 costuma ser CORS / servidor offline / DNS / network
  if (err.status === 0) return 'Sem conexão com o servidor. Verifique rede/URL.';

  switch (err.status) {
    case 400: return 'Requisição inválida.';
    case 401: return 'E-mail ou senha inválidos.';
    case 403: return 'Acesso negado.';
    case 404: return 'Serviço de autenticação não encontrado.';
    case 409: return 'Conflito na requisição.';
    case 422: return 'Dados inválidos.';
    case 429: return 'Muitas tentativas. Aguarde e tente novamente.';
    case 500: return 'Erro interno do servidor.';
    case 503: return 'Serviço indisponível no momento.';
    default:  return `Erro inesperado (${err.status}).`;
  }
}

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const message = mapHttpError(err);

        // Propaga um erro mais “limpo” pro service/component
        return throwError(() => ({ status: err.status, message }));
      }

      return throwError(() => ({ status: -1, message: 'Erro desconhecido.' }));
    })
  );
};
