
export interface Capacitacao {
  id: string;
  nome_capacitacao: string;
  data_inicio: string;
  data_fim: string;
  instrutor: string;
  carga_horaria: string;
  // Campos do tipo antigo que não estão no CSV, mantidos como opcionais para evitar quebras em outras partes do código
  servidor?: string;
  matricula?: string;
  uorg?: string;
  evento?: string;
  status?: 'Concluído' | 'Em andamento' | 'Cancelado' | 'Pendente';
  instituicao_promotora?: string;
  modalidade?: 'EAD' | 'Presencial' | 'Híbrido';
  data_termino?: string;
  valor_evento?: number;
  data_criacao?: string;
  data_atualizacao?: string;
}

export type Page = 'Dashboard' | 'Cadastrar Capacitação' | 'Relatórios';

export interface BulkUploadError {
  linha: number;
  erro: string;
}
