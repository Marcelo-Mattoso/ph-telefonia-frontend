import { Injectable } from '@angular/core';
import { CrudItem } from './item.model';

const KEY = 'demo_items';

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

@Injectable({ providedIn: 'root' })
export class CrudService {
  private seedIfEmpty() {
    const items = this.readRaw();
    if (items.length) return;

    const seeded: CrudItem[] = [
      { id: uid(), dado1: 'dado 1', dado2: 'dado 2', dado3: 'dado 3', isDeleted: false, updatedAt: new Date().toISOString() },
      { id: uid(), dado1: 'dado 1', dado2: 'dado 2', dado3: 'dado 3', isDeleted: false, updatedAt: new Date().toISOString() },
      { id: uid(), dado1: 'dado 1', dado2: 'dado 2', dado3: 'dado 3', isDeleted: false, updatedAt: new Date().toISOString() },
    ];
    localStorage.setItem(KEY, JSON.stringify(seeded));
  }

  private readRaw(): CrudItem[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }

  private uid() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  create(data: { dado1: string; dado2: string; dado3: string }) {
    const all = this.readRaw();

    const newItem = {
      id: this.uid(),
      dado1: data.dado1,
      dado2: data.dado2,
      dado3: data.dado3,
      isDeleted: false,
      updatedAt: new Date().toISOString()
    };

    all.push(newItem);
    localStorage.setItem(KEY, JSON.stringify(all));
  }

  listActive(): CrudItem[] {
    this.seedIfEmpty();
    return this.readRaw().filter(x => !x.isDeleted);
  }

  update(item: CrudItem): void {
    const all = this.readRaw();
    const idx = all.findIndex(x => x.id === item.id);
    if (idx >= 0) {
      all[idx] = { ...item, updatedAt: new Date().toISOString() };
      localStorage.setItem(KEY, JSON.stringify(all));
    }
  }

  softDelete(id: string): void {
    const all = this.readRaw();
    const idx = all.findIndex(x => x.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], isDeleted: true, updatedAt: new Date().toISOString() };
      localStorage.setItem(KEY, JSON.stringify(all));
    }
  }
}
