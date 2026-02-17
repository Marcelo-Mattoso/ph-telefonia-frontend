import { Injectable } from '@angular/core';
import { ValidationState } from './order.model';

function onlyDigits(v: string) {
  return (v || '').replace(/\D/g, '');
}

@Injectable({ providedIn: 'root' })
export class ValidationService {

  // Receita: CNPJ ativo (mock)
  receita(cnpj: string): ValidationState {
    const d = onlyDigits(cnpj);
    if (!d) return 'pending';
    if (d.length !== 14) return 'problem';
    if (d.endsWith('000')) return 'problem';
    return 'ok';
  }

  // Estadual (Sintegra): mock async (simula consulta)
  async estadual(cnpj: string): Promise<ValidationState> {
    const d = onlyDigits(cnpj);
    if (!d) return 'pending';
    if (d.length !== 14) return 'problem';

    // simula rede/consulta
    await new Promise(r => setTimeout(r, 900));

    if (d.startsWith('00')) return 'problem';
    return 'ok';
  }
}
