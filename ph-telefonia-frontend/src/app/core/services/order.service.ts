import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OrderRow, ValidationState } from '../models/order.model';

type OrdersEnvelope = {
  data?: unknown;
  orders?: unknown;
  items?: unknown;
};

type OrderUpsertInput = Omit<OrderRow, 'id' | 'updatedAt' | 'isDeleted'>;

@Injectable({ providedIn: 'root' })
export class OrderService {

  private readonly baseUrl = '/api/orders';

  constructor(private http: HttpClient) {}

  async listActive(): Promise<OrderRow[]> {
    const response = await firstValueFrom(this.http.get<unknown>(this.baseUrl));
    const rawArray = this.extractArray(response);

    const normalized: OrderRow[] = rawArray.map((data: any, index: number) => ({
      ...data,

      id: data?.id ?? data?._id ?? String(index),
      isDeleted: !!data?.isDeleted,

      // ✅ evita crash se validacoes vier undefined
      receita: this.toState(data?.validacoes?.receita),
      estadual: this.toState(data?.validacoes?.estadual),
    }));

    return normalized.filter(x => !x.isDeleted);
  }

  async create(row: OrderUpsertInput): Promise<OrderRow> {
    const payload = this.buildPayload(row);
    return firstValueFrom(this.http.post<OrderRow>(this.baseUrl, payload));
  }

  async update(id: string, row: OrderUpsertInput) {
    const payload = this.buildPayload(row);
    return firstValueFrom(this.http.patch(`${this.baseUrl}/${id}`, payload));
  }

  async softDelete(id: string) {
    return firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
  }

  // =============================
  // Helpers privados
  // =============================

  private extractArray(res: unknown): any[] {
    if (Array.isArray(res)) return res;

    const env = res as OrdersEnvelope;

    if (env && Array.isArray(env.items)) return env.items as any[];
    if (env && Array.isArray(env.data)) return env.data as any[];
    if (env && Array.isArray(env.orders)) return env.orders as any[];

    return [];
  }

  /**
   * Monta o payload que o backend espera.
   * - garante portabilidade boolean
   * - envia validacoes { receita, estadual }
   * - NÃO envia openCnpj
   * - NÃO envia receita/estadual "achatados" (só pro front)
   */
  private buildPayload(row: OrderUpsertInput) {
    // remove campos do front que não devem ir pro back
    const {
      receita,       // front-only
      estadual,      // front-only
      // @ts-ignore
      openCnpj,      // ignorar se existir no draft por acidente
      ...rest
    } = row as any;

    return {
      ...rest,
      portabilidade: !!row.portabilidade,
      validacoes: {
        receita: row.receita,
        estadual: row.estadual,
      },
    };
  }

  private toState(value: unknown): ValidationState {
    if (value === null || value === undefined || value === '') return 'pending';

    if (typeof value === 'boolean') return value ? 'ok' : 'problem';

    if (typeof value === 'number') {
      if (value === 1) return 'ok';
      if (value === 0) return 'pending';
      return 'problem';
    }

    const v = String(value).trim().toLowerCase();

    if (['ok', 'ativo', 'valid', 'valido', 'válido', 'aprovado', 'true'].includes(v)) return 'ok';
    if (['pending', 'pendente', 'em análise', 'em analise', 'aguardando'].includes(v)) return 'pending';
    if (['erro', 'problem', 'invalido', 'inválido', 'reprovado', 'bloqueado', 'false', 'irregular'].includes(v)) return 'problem';

    return 'pending';
  }
}
