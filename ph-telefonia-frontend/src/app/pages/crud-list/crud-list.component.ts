import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ShellComponent } from '../../shared/shell/shell.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ValidationBadgeComponent } from '../../shared/validation-badge/validation-badge.component';

import { OrderRow } from '../../core/models';
import { OrderService, ValidationService } from '../../core/services';

function onlyDigits(v: string) {
  return (v || '').replace(/\D/g, '');
}

@Component({
  standalone: true,
  imports: [FormsModule, ShellComponent, ModalComponent, ValidationBadgeComponent],
  templateUrl: './crud-list.component.html',
  styleUrls: ['./crud-list.component.css'],
})
export class CrudListComponent implements OnInit {
  items = signal<OrderRow[]>([]);
  loading = signal<boolean>(false);

  editOpen = false;
  deleteOpen = false;

  saving = false;
  formError = '';

  selected: OrderRow | null = null;

  draft: Omit<OrderRow, 'id' | 'updatedAt' | 'isDeleted'> = this.emptyDraft();

  constructor(
    private orders: OrderService,
    private validator: ValidationService
  ) {}

  async ngOnInit() {
    await this.reload();
  }

  private emptyDraft(): Omit<OrderRow, 'id' | 'updatedAt' | 'isDeleted'> {
    return {
      data: new Date().toISOString().slice(0, 10),
      mes: new Date().toISOString().slice(0, 7),
      consultor: '',

      cpf: '',
      razaoSocial: '',
      cnpj: '',

      novoOuBase: 'NOVO',
      produtoVendendo: '',
      operadora: '',

      portabilidade: false,
      numeroPortado: '',
      numeroAPortar: '',

      statusProcesso: '',
      planoUtilizado: '',

      receita: 'pending',
      estadual: 'pending',
    };
  }

  async reload() {
    this.loading.set(true);
    try {
      const data = await this.orders.listActive();
      this.items.set(Array.isArray(data) ? data : []);
    } catch (e) {
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  openCreate() {
    this.formError = '';
    this.selected = null;
    this.draft = this.emptyDraft();
    this.editOpen = true;
  }

  openEdit(item: OrderRow) {
    this.formError = '';
    this.selected = item;

    const { id, updatedAt, isDeleted, ...rest } = item;
    this.draft = { ...rest };

    this.editOpen = true;
  }

  openDelete(item: OrderRow) {
    this.selected = item;
    this.deleteOpen = true;
  }

  async onCnpjChanged() {
    this.draft.receita = this.validator.receita(this.draft.cnpj);

    this.draft.estadual = 'pending';
    const result = await this.validator.estadual(this.draft.cnpj);
    this.draft.estadual = result;
  }

  async save() {
    this.formError = '';
    this.saving = true;

    try {
      // validações mínimas de front (bem básicas)
      const cpf = onlyDigits(this.draft.cpf);
      const cnpj = onlyDigits(this.draft.cnpj);

      if (cpf && cpf.length !== 11) {
        this.formError = 'CPF inválido (precisa ter 11 dígitos).';
        return;
      }
      if (cnpj && cnpj.length !== 14) {
        this.formError = 'CNPJ inválido (precisa ter 14 dígitos).';
        return;
      }

      if (this.draft.portabilidade) {
        const n1 = onlyDigits(this.draft.numeroPortado || '');
        const n2 = onlyDigits(this.draft.numeroAPortar || '');
        if (!n1 || !n2) {
          this.formError = 'Preencha número portado e número a portar.';
          return;
        }
      }

      if (this.selected) {
        await this.orders.update(this.selected.id, this.draft);
      } else {
        await this.orders.create(this.draft);
      }

      this.editOpen = false;
      this.selected = null;
      await this.reload();
    } catch (e: any) {
      this.formError = e?.message || 'Erro ao salvar.';
    } finally {
      this.saving = false;
    }
  }

  async confirmDelete() {
    if (!this.selected) return;

    try {
      await this.orders.softDelete(this.selected.id);
      this.deleteOpen = false;
      this.selected = null;
      await this.reload();
    } catch (e) {
      // se quiser, pode setar um erro global aqui
    }
  }

  closeEdit() {
    this.editOpen = false;
    this.selected = null;
  }
}
