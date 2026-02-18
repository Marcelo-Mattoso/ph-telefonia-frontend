import { OrderRow } from './order.model';

/**
 * Dados que o formulário de criação de order precisa
 * Subset dos campos de OrderRow, focado na criação
 */
export type CreateOrderFormData = Omit<OrderRow, 'id' | 'updatedAt' | 'isDeleted'>;

/**
 * Resposta da busca de CNPJ
 */
export type CnpjSearchResult = {
  found: boolean;
  data?: Partial<CreateOrderFormData>;
  message?: string;
};

/**
 * Estado do formulário
 */
export enum FormState {
  LOADING_CNPJ = 'loading_cnpj',
  READY = 'ready',
  FILLED = 'filled',
  ERROR = 'error',
}
