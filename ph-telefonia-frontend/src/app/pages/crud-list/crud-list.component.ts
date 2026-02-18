import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { ShellComponent } from '../../shared/shell/shell.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ValidationBadgeComponent } from '../../shared/validation-badge/validation-badge.component';

import { OrderRow } from '../../core/models';
import { OrderService } from '../../core/services';

@Component({
  standalone: true,
  imports: [FormsModule, RouterModule, ShellComponent, ModalComponent, ValidationBadgeComponent],
  templateUrl: './crud-list.component.html',
  styleUrls: ['./crud-list.component.css'],
})
export class CrudListComponent implements OnInit {
  items = signal<OrderRow[]>([]);
  loading = signal<boolean>(false);

  deleteOpen = false;
  editOpen = false;

  saving = false;
  editError = '';

  selected: OrderRow | null = null;
  editData: Partial<OrderRow> | null = null;

  constructor(
    private orders: OrderService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.reload();
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

  openDelete(item: OrderRow) {
    this.selected = item;
    this.deleteOpen = true;
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

  goToCreateOrder() {
    this.router.navigate(['/create-order']);
  }

  openEdit(item: OrderRow) {
    this.selected = item;
    this.editData = { ...item };
    this.editError = '';
    this.editOpen = true;
  }

  closeEdit() {
    this.editOpen = false;
    this.selected = null;
    this.editData = null;
    this.editError = '';
  }

  async saveEdit() {
    if (!this.selected || !this.editData) return;

    if (!this.editData.razaoSocial) {
      this.editError = 'Razão Social é obrigatória';
      return;
    }

    this.saving = true;
    try {
      const { id, updatedAt, isDeleted, ...updateData } = this.editData as any;
      await this.orders.update(this.selected.id, updateData);
      this.closeEdit();
      await this.reload();
    } catch (error: any) {
      this.editError = error?.message || 'Erro ao salvar alterações';
    } finally {
      this.saving = false;
    }
  }
}
