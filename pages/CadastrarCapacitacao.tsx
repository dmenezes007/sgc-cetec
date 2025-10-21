import React, { useState } from 'react';
import { UploadIcon } from '../components/icons/Icons';
import { BulkUploadError, Capacitacao } from '../types';

type Tab = 'individual' | 'lote';

const CadastrarCapacitacao: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('individual');
    
    // States for bulk upload
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState<{ success: number; errors: BulkUploadError[] } | null>(null);

    // States for individual registration
    const [formData, setFormData] = useState<Partial<Capacitacao>>({
        ano: new Date().getFullYear(),
        servidor: '',
        cargo_de_chefia: '',
        matricula: undefined,
        coord_geral: '',
        uorg: '',
        base_maiuscula: '',
        evento: '',
        status: '',
        carga_horaria: 0,
        instituicao_promotora: '',
        cnpjcpf: '',
        modalidade: '',
        linha_de_capacitacao: '',
        programa_interno_cetec: '',
        data_inicio: '',
        data_termino: '',
        mes: '',
        iniciativa: '',
        devolutiva_pdp: '',
        gratuito_ou_pago: '',
        valor_evento: 0,
        valor_diaria: 0,
        valor_passagem: 0,
        com_ou_sem_afastamento: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
            setUploadResult(null);
        }
    };

    const handleBulkUpload = () => {
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);
        setUploadResult(null);

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setUploading(false);
                    // Simulate API response
                    setUploadResult({
                        success: 95,
                        errors: [
                            { linha: 15, erro: "Formato de data inválido para 'data_inicio'. Use AAAA-MM-DD." },
                            { linha: 42, erro: "'carga_horaria' deve ser um número inteiro." },
                        ]
                    });
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleIndividualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch('/api/capacitacoes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Falha ao cadastrar capacitação');
            }

            setSubmitStatus({ success: true, message: 'Capacitação cadastrada com sucesso!' });
            setFormData({
                ano: new Date().getFullYear(),
                servidor: '',
                cargo_de_chefia: '',
                matricula: undefined,
                coord_geral: '',
                uorg: '',
                base_maiuscula: '',
                evento: '',
                status: '',
                carga_horaria: 0,
                instituicao_promotora: '',
                cnpjcpf: '',
                modalidade: '',
                linha_de_capacitacao: '',
                programa_interno_cetec: '',
                data_inicio: '',
                data_termino: '',
                mes: '',
                iniciativa: '',
                devolutiva_pdp: '',
                gratuito_ou_pago: '',
                valor_evento: 0,
                valor_diaria: 0,
                valor_passagem: 0,
                com_ou_sem_afastamento: ''
            });
        } catch (error: any) {
            setSubmitStatus({ success: false, message: error.message || 'Ocorreu um erro.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-dark-text mb-6">Cadastrar Capacitação</h2>

            <div className="bg-white p-2 rounded-lg shadow-md mb-6 max-w-md">
                <div className="flex space-x-1">
                    <button onClick={() => setActiveTab('individual')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'individual' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Cadastro Individual
                    </button>
                    <button onClick={() => setActiveTab('lote')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'lote' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Importar em Lote
                    </button>
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
                {activeTab === 'individual' && (
                    <form className="grid grid-cols-1 md:grid-cols-3 gap-6" onSubmit={handleIndividualSubmit}>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Evento</label>
                            <input type="text" name="evento" value={formData.evento} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Servidor</label>
                            <input type="text" name="servidor" value={formData.servidor} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Matrícula</label>
                            <input type="number" name="matricula" value={formData.matricula} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cargo de Chefia</label>
                            <input type="text" name="cargo_de_chefia" value={formData.cargo_de_chefia} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Coordenação Geral</label>
                            <input type="text" name="coord_geral" value={formData.coord_geral} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">UORG</label>
                            <input type="text" name="uorg" value={formData.uorg} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Base Maiúscula</label>
                            <input type="text" name="base_maiuscula" value={formData.base_maiuscula} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <input type="text" name="status" value={formData.status} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Carga Horária (horas)</label>
                            <input type="number" name="carga_horaria" value={formData.carga_horaria} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Instituição Promotora</label>
                            <input type="text" name="instituicao_promotora" value={formData.instituicao_promotora} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">CNPJ/CPF</label>
                            <input type="text" name="cnpjcpf" value={formData.cnpjcpf} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Modalidade</label>
                            <input type="text" name="modalidade" value={formData.modalidade} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Linha de Capacitação</label>
                            <input type="text" name="linha_de_capacitacao" value={formData.linha_de_capacitacao} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Programa Interno CETEC</label>
                            <input type="text" name="programa_interno_cetec" value={formData.programa_interno_cetec} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data de Início</label>
                            <input type="date" name="data_inicio" value={formData.data_inicio} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data de Término</label>
                            <input type="date" name="data_termino" value={formData.data_termino} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mês</label>
                            <input type="text" name="mes" value={formData.mes} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Iniciativa</label>
                            <input type="text" name="iniciativa" value={formData.iniciativa} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Devolutiva PDP</label>
                            <input type="text" name="devolutiva_pdp" value={formData.devolutiva_pdp} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gratuito ou Pago</label>
                            <input type="text" name="gratuito_ou_pago" value={formData.gratuito_ou_pago} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Valor do Evento</label>
                            <input type="number" name="valor_evento" value={formData.valor_evento} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Valor da Diária</label>
                            <input type="number" name="valor_diaria" value={formData.valor_diaria} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Valor da Passagem</label>
                            <input type="number" name="valor_passagem" value={formData.valor_passagem} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Com ou Sem Afastamento</label>
                            <input type="text" name="com_ou_sem_afastamento" value={formData.com_ou_sem_afastamento} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ano</label>
                            <input type="number" name="ano" value={formData.ano} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        
                        <div className="md:col-span-3 text-right">
                            <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                        {submitStatus && (
                            <div className={`md:col-span-3 mt-4 text-sm p-3 rounded-md ${submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {submitStatus.message}
                            </div>
                        )}
                    </form>
                )}

                {activeTab === 'lote' && (
                    <div>
                        <div className="max-w-xl mx-auto text-center">
                            <label htmlFor="file-upload" className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-primary transition-colors">
                                <UploadIcon />
                                <span className="mt-2 block text-sm font-medium text-gray-900">
                                    {file ? file.name : "Clique para selecionar ou arraste o arquivo"}
                                </span>
                                <span className="block text-xs text-gray-500">XLSX ou CSV</span>
                            </label>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".xlsx, .csv" onChange={handleFileChange} />
                        </div>

                        {file && !uploading && !uploadResult && (
                           <div className="text-center mt-6">
                               <button onClick={handleBulkUpload} className="py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                   Iniciar Importação
                               </button>
                           </div>
                        )}
                        
                        {uploading && (
                             <div className="mt-8">
                                <p className="text-center text-sm font-medium text-gray-700 mb-2">Importando...</p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            </div>
                        )}

                        {uploadResult && (
                            <div className="mt-8 p-4 rounded-md bg-gray-50 border border-gray-200">
                                <h4 className="font-semibold text-lg text-dark-text">Resultado da Importação</h4>
                                <p className="text-green-600 mt-2 font-medium">{uploadResult.success} registros importados com sucesso.</p>
                                {uploadResult.errors.length > 0 && (
                                  <div className="mt-4">
                                      <p className="text-red-600 font-medium">{uploadResult.errors.length} registros com erro:</p>
                                      <ul className="list-disc list-inside mt-2 text-sm text-red-700 bg-red-50 p-3 rounded-md">
                                          {uploadResult.errors.map((err, index) => (
                                              <li key={index}><strong>Linha {err.linha}:</strong> {err.erro}</li>
                                          ))}
                                      </ul>
                                  </div>  
                                )}
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default CadastrarCapacitacao;