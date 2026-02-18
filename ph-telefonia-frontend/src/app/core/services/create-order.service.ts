import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CnpjSearchResult, CreateOrderFormData } from '../models/create-order.model';

@Injectable({ providedIn: 'root' })
export class CreateOrderService {
  private readonly baseUrl = '/api/orders';

  constructor(private http: HttpClient) {}

  /**
   * Busca um CNPJ na base de dados
   * Se encontrar, retorna os dados preenchidos
   * Se não encontrar, retorna um objeto vazio para preenchimento manual
   */
  async searchByCnpj(cnpj: string): Promise<CnpjSearchResult> {
    try {
      // Remove tudo que não for dígito
      const cleanCnpj = cnpj.replace(/\D/g, '');

      if (cleanCnpj.length !== 14) {
        return {
          found: false,
          message: 'CNPJ deve conter 14 dígitos',
        };
      }

      // Tenta buscar o CNPJ no backend
      const response = await firstValueFrom(
        this.http.get<any>(`/api/search/cnpj?cnpj=${cleanCnpj}`)
      );

      // Verifica se encontrou items na resposta
      if (response && response.ok && response.items && response.items.length > 0) {
        // Encontrou! Retorna os dados preenchidos
        const orderData = response.items[0];
        return {
          found: true,
          data: this.normalizeData(orderData),
          message: 'CNPJ encontrado! Dados carregados.',
        };
      }

      // Não encontrou
      return {
        found: false,
        data: this.getEmptyFormData(),
        message: 'CNPJ não encontrado. Preencha os dados manualmente.',
      };
    } catch (error: any) {
      // Se der erro na requisição
      if (error.status === 404) {
        return {
          found: false,
          data: this.getEmptyFormData(),
          message: 'CNPJ não encontrado.',
        };
      }

      return {
        found: false,
        message: `Erro ao buscar CNPJ: ${error.message}`,
      };
    }
  }

  /**
   * Normaliza os dados retornados do backend
   */
  private normalizeData(data: any): Partial<CreateOrderFormData> {
    return {
      data: data.data,
      mes: data.mes,
      consultor: data.consultor,
      cpf: data.cpf,
      razaoSocial: data.openCnpj?.razao_social || data.razaoSocial || '',
      cnpj: data.cnpj,
      novoOuBase: data.novoOuBase,
      produtoVendendo: data.produtoVendendo,
      operadora: data.operadora,
      portabilidade: data.portabilidade ?? false,
      numeroPortado: data.numeroPortado,
      numeroAPortar: data.numeroAPortar,
      planoUtilizado: data.planoUtilizado,
      receita: data.validacoes?.receita || 'pending',
      estadual: data.validacoes?.estadual || 'pending',
    };
  }

  /**
   * Retorna um formulário vazio pronto para preenchimento
   */
  private getEmptyFormData(): Partial<CreateOrderFormData> {
    return {
      data: new Date().toISOString().split('T')[0],
      mes: '',
      consultor: '',
      cpf: '',
      razaoSocial: '',
      cnpj: '',
      produtoVendendo: '',
      operadora: '',
      portabilidade: false,
      numeroPortado: undefined,
      numeroAPortar: undefined,
      planoUtilizado: '',
      receita: 'pending',
      estadual: 'pending',
    };
  }

  /**
   * Cria uma nova order
   * Sempre preenche statusProcesso como "em andamento"
   */
  async create(data: CreateOrderFormData) {
    const payload = {
      ...data,
      statusProcesso: 'em andamento',
    };
    return firstValueFrom(this.http.post<any>(this.baseUrl, payload));
  }
}
