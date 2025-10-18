
import React, { useState } from 'react';
import { UploadIcon } from '../components/icons/Icons';
import { BulkUploadError } from '../types';

type Tab = 'individual' | 'lote';

const CadastrarCapacitacao: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('individual');
    
    // States for bulk upload
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState<{ success: number; errors: BulkUploadError[] } | null>(null);

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
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Nome do Servidor</label>
                            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Matrícula</label>
                            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">UORG</label>
                            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Evento / Curso</label>
                            <textarea rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                                <option>Concluído</option>
                                <option>Em andamento</option>
                                <option>Pendente</option>
                                <option>Cancelado</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Carga Horária (horas)</label>
                            <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Instituição Promotora</label>
                            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Modalidade</label>
                            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                                <option>EAD</option>
                                <option>Presencial</option>
                                <option>Híbrido</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Valor do Evento (R$)</label>
                            <input type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data de Início</label>
                            <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data de Término</label>
                            <input type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                        </div>
                        <div className="md:col-span-2 text-right">
                            <button type="submit" className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                Salvar
                            </button>
                        </div>
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
