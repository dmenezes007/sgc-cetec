
export interface Capacitacao {
  id: number;
  servidor: string;
  matricula: string;
  uorg: string;
  evento: string;
  status: 'Concluído' | 'Em andamento' | 'Cancelado' | 'Pendente';
  carga_horaria: number;
  instituicao_promotora: string;
  modalidade: 'EAD' | 'Presencial' | 'Híbrido';
  data_inicio: string; // YYYY-MM-DD
  data_termino: string; // YYYY-MM-DD
  valor_evento: number;
  data_criacao: string;
  data_atualizacao: string;
}

export type Page = 'Dashboard' | 'Cadastrar Capacitação' | 'Relatórios';

export interface BulkUploadError {
  linha: number;
  erro: string;
}
