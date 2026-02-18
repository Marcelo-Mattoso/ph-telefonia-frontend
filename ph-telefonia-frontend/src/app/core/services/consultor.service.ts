import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type ConsultorItem = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ConsultoresResponse = {
  ok: boolean;
  items?: ConsultorItem[];
};

@Injectable({ providedIn: 'root' })
export class ConsultorService {
  private readonly baseUrl = 'http://localhost:3000/api/consultores';
  private consultoresCache: ConsultorItem[] = [];

  constructor(private http: HttpClient) {}

  /**
   * Busca lista de consultores
   */
  async getConsultores(): Promise<ConsultorItem[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ConsultoresResponse>(this.baseUrl)
      );

      if (response && response.ok && response.items) {
        this.consultoresCache = response.items;
        return response.items;
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar consultores:', error);
      // Retorna cache em caso de erro
      return this.consultoresCache;
    }
  }

  /**
   * Retorna lista em cache se disponível
   */
  getConsultoresCache(): ConsultorItem[] {
    return this.consultoresCache;
  }
}
