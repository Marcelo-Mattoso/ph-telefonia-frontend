/**
 * EXEMPLO DE USO - Teste de Tipagem e Integração
 * Este arquivo mostra como usar os novos serviços
 */

import { CreateOrderService } from './core/services/create-order.service';
import { FormState, CreateOrderFormData, CnpjSearchResult } from './core/models/create-order.model';

/**
 * Exemplo 1: Buscar CNPJ
 */
async function exemploBuscarCnpj(service: CreateOrderService) {
  try {
    const resultado: CnpjSearchResult = await service.searchByCnpj('11.222.333/0001-81');
    
    if (resultado.found && resultado.data) {
      console.log('✅ CNPJ encontrado!');
      console.log('Dados:', resultado.data);
    } else {
      console.log('ℹ️ CNPJ não encontrado. Preencher manualmente');
      console.log('Mensagem:', resultado.message);
    }
  } catch (error) {
    console.error('❌ Erro na busca:', error);
  }
}

/**
 * Exemplo 2: Criar Order
 */
async function exemploCreateOrder(service: CreateOrderService) {
  const novaOrder: CreateOrderFormData = {
    data: '2026-02-17',
    mes: '02/2026',
    consultor: 'João Silva',
    cpf: '123.456.789-00',
    razaoSocial: 'Empresa XYZ Ltda',
    cnpj: '11.222.333/0001-81',
    novoOuBase: 'NOVO',
    produtoVendendo: 'Telefonia',
    operadora: 'Vivo',
    portabilidade: false,
    statusProcesso: 'Processando',
    planoUtilizado: 'Premium',
    receita: 'pending',
    estadual: 'pending',
  };

  try {
    const resultado = await service.create(novaOrder);
    console.log('✅ Order criada com sucesso!');
    console.log('ID:', resultado.id);
  } catch (error) {
    console.error('❌ Erro ao criar order:', error);
  }
}

/**
 * Exemplo 3: Estados do Formulário
 */
function exemploEstados() {
  const estado1: FormState = FormState.LOADING_CNPJ;  // Buscando
  const estado2: FormState = FormState.READY;         // Pronto
  const estado3: FormState = FormState.FILLED;        // Preenchido
  const estado4: FormState = FormState.ERROR;         // Erro

  console.log('Estados disponíveis:', { estado1, estado2, estado3, estado4 });
}

/**
 * Exemplo 4: Type-checking no template Angular
 * 
 * No componente TypeScript:
 * formData: Signal<Partial<CreateOrderFormData>> = signal({});
 * 
 * No HTML template:
 * [(ngModel)]="formData().cnpj"         ✅ OK - Propriedade existe
 * [(ngModel)]="formData().campo_invalido"  ❌ ERRO - Typescript alerta!
 */
