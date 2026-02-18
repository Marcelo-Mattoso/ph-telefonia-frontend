import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ShellComponent } from '../../shared/shell/shell.component';
import { ValidationBadgeComponent } from '../../shared/validation-badge/validation-badge.component';

import { CreateOrderService } from '../../core/services/create-order.service';
import { ConsultorService, ConsultorItem } from '../../core/services/consultor.service';
import { FormState, CreateOrderFormData } from '../../core/models/create-order.model';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, FormsModule, ShellComponent, ValidationBadgeComponent],
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css'],
})
export class CreateOrderComponent implements OnInit {
  // Signals para reatividade
  formState = signal<FormState>(FormState.READY);
  formData = signal<Partial<CreateOrderFormData>>({});
  cnpj = signal<string>('');
  consultores = signal<ConsultorItem[]>([]);
  loadingConsultores = signal<boolean>(false);

  // Estados da UI
  showForm = signal<boolean>(false);
  isSearching = signal<boolean>(false);
  searchMessage = signal<string>('');
  saving = signal<boolean>(false);
  formError = signal<string>('');
  successMessage = signal<string>('');

  // Enums para template
  FormState = FormState;

  constructor(
    private createOrderService: CreateOrderService,
    private consultorService: ConsultorService,
    private orderService: OrderService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.carregarConsultores();
  }

  /**
   * Carrega lista de consultores
   */
  private async carregarConsultores() {
    this.loadingConsultores.set(true);
    try {
      const consultoresData = await this.consultorService.getConsultores();
      this.consultores.set(consultoresData);
    } catch (error) {
      console.error('Erro ao carregar consultores:', error);
      this.consultores.set([]);
    } finally {
      this.loadingConsultores.set(false);
    }
  }

  /**
   * Inicializa o formulário vazio
   */
  private initializeForm() {
    this.formData.set({
      data: new Date().toISOString().split('T')[0],
      portabilidade: false,
      receita: 'pending',
      estadual: 'pending',
    });
  }

  /**
   * Formata CNPJ enquanto o usuário digita
   */
  formatCnpj(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return cleaned.slice(0, 2) + '.' + cleaned.slice(2);
    if (cleaned.length <= 8) return cleaned.slice(0, 2) + '.' + cleaned.slice(2, 5) + '.' + cleaned.slice(5);
    return (
      cleaned.slice(0, 2) +
      '.' +
      cleaned.slice(2, 5) +
      '.' +
      cleaned.slice(5, 8) +
      '/' +
      cleaned.slice(8, 12) +
      '-' +
      cleaned.slice(12, 14)
    );
  }

  /**
   * Executa a busca do CNPJ
   */
  async searchCnpj() {
    const cnpjValue = this.cnpj();

    if (!cnpjValue || cnpjValue.replace(/\D/g, '').length !== 14) {
      this.searchMessage.set('Digite um CNPJ válido (14 dígitos)');
      this.formError.set('CNPJ inválido');
      return;
    }

    this.isSearching.set(true);
    this.formError.set('');
    this.searchMessage.set('');
    this.formState.set(FormState.LOADING_CNPJ);

    try {
      const result = await this.createOrderService.searchByCnpj(cnpjValue);
      this.searchMessage.set(result.message || '');

      if (result.found && result.data) {
        // Encontrou! Preenche o formulário com novoOuBase = 'BASE'
        const mergedData = {
          ...this.formData(),
          ...result.data,
          novoOuBase: 'BASE' as const,
        };
        this.formData.set(mergedData);
        this.formState.set(FormState.FILLED);
      } else {
        // Não encontrou, deixa o formulário vazio com novoOuBase = 'NOVO'
        const emptyData = {
          data: new Date().toISOString().split('T')[0],
          cnpj: cnpjValue.replace(/\D/g, ''),
          novoOuBase: 'NOVO' as const,
          portabilidade: false,
          receita: 'pending',
          estadual: 'pending',
        } as Partial<CreateOrderFormData>;
        this.formData.set(emptyData);
        this.formState.set(FormState.READY);
      }

      this.showForm.set(true);
    } catch (error: any) {
      this.formError.set('Erro ao buscar CNPJ: ' + error.message);
      this.formState.set(FormState.ERROR);
    } finally {
      this.isSearching.set(false);
    }
  }

  /**
   * Salva a order
   */
  async saveOrder() {
    const data = this.formData() as CreateOrderFormData;

    // Validações básicas
    if (!data.cnpj) {
      this.formError.set('CNPJ é obrigatório');
      return;
    }

    if (!data.razaoSocial) {
      this.formError.set('Razão Social é obrigatória');
      return;
    }

    this.saving.set(true);
    this.formError.set('');
    this.successMessage.set('');

    try {
      await this.orderService.create(data);
      this.successMessage.set('Order criada com sucesso!');

      // Aguarda um pouco e volta para a lista
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
    } catch (error: any) {
      this.formError.set('Erro ao salvar: ' + error.message);
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Cancela a operação
   */
  cancel() {
    this.router.navigate(['/']);
  }

  /**
   * Atualiza os dados do formulário
   */
  updateFormData(field: keyof CreateOrderFormData, value: any) {
    const currentData = this.formData();
    this.formData.set({
      ...currentData,
      [field]: value,
    });
  }
}
