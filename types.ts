export interface Capacitacao {
    id: number;
    ano: number;
    servidor: string;
    cargo_de_chefia: string;
    matricula: number;
    coord_geral: string;
    uorg: string;
    base_maiuscula: string;
    evento: string;
    status: string;
    carga_horaria: number;
    instituicao_promotora: string;
    cnpjcpf: string;
    modalidade: string;
    linha_de_capacitacao: string;
    programa_interno_cetec: string;
    data_inicio: string;
    data_termino: string;
    mes: string;
    iniciativa: string;
    devolutiva_pdp: string;
    gratuito_ou_pago: string;
    valor_evento: number;
    valor_diaria: number;
    valor_passagem: number;
    com_ou_sem_afastamento: string;
}

export type Page = 'Overview' | 'Cadastrar Capacitação' | 'Relatórios';

export interface BulkUploadError {
  linha: number;
  erro: string;
}