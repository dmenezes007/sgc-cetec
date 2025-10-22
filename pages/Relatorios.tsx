import React, { useState, useMemo } from 'react';
import { Capacitacao } from '../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Relatorios: React.FC = () => {
    const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const [filters, setFilters] = useState({
        termo: '',
        dataInicio: '',
        dataFim: '',
    });

    const handleSearch = async () => {
        setIsLoading(true);
        setSearched(true);
        setError(null);
        try {
            // Simulating an API call
            const response = await fetch(`/api/capacitacoes`);
            if (!response.ok) {
                throw new Error('Falha ao buscar capacitações');
            }
            const data = await response.json();
            setCapacitacoes(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        if (!searched) {
            return [];
        }
        return capacitacoes.filter(item => {
            const termoMatch = filters.termo.toLowerCase() === '' ||
                (item.evento && item.evento.toLowerCase().includes(filters.termo.toLowerCase())) ||
                (item.servidor && item.servidor.toLowerCase().includes(filters.termo.toLowerCase()));

            const itemDate = new Date(item.data_inicio);
            const startDate = filters.dataInicio ? new Date(filters.dataInicio) : null;
            const endDate = filters.dataFim ? new Date(filters.dataFim) : null;

            if (startDate) startDate.setHours(0, 0, 0, 0);
            if (endDate) endDate.setHours(23, 59, 59, 999);

            const dataInicioMatch = !startDate || itemDate >= startDate;
            const dataFimMatch = !endDate || itemDate <= endDate;

            return termoMatch && dataInicioMatch && dataFimMatch;
        });
    }, [filters, capacitacoes, searched]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            termo: '',
            dataInicio: '',
            dataFim: '',
        });
        setSearched(false);
        setCapacitacoes([]);
    };

    const handleExportExcel = () => {
        if (filteredData.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }
        const dataToExport = filteredData.map(item => ({
            'Servidor': item.servidor,
            'Evento': item.evento,
            'Carga Horária': item.carga_horaria,
            'Data Início': new Date(item.data_inicio).toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
            'Data Fim': new Date(item.data_termino).toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
        XLSX.writeFile(workbook, "RelatorioCapacitacoes.xlsx");
    };

    const handleExportPdf = () => {
        if (filteredData.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }

        try {
            const doc = new jsPDF();
            const tableData = filteredData.map(item => [
                item.servidor,
                item.evento,
                item.carga_horaria,
                new Date(item.data_inicio).toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
                new Date(item.data_termino).toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
            ]);

            (doc as any).autoTable({
                head: [['Servidor', 'Evento', 'Carga Horária', 'Data Início', 'Data Fim']],
                body: tableData,
                styles: {
                    font: "helvetica",
                    fontSize: 8
                },
                headStyles: {
                    fillColor: [22, 160, 133], // Exemplo de cor
                    textColor: 255,
                    fontStyle: 'bold'
                }
            });

            doc.save("RelatorioCapacitacoes.pdf");
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-3xl font-bold text-dark-text mb-6">Relatórios de Capacitações</h2>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Buscar por Evento ou Servidor</label>
                        <input type="text" name="termo" value={filters.termo} onChange={handleFilterChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700">Data Início (a partir de)</label>
                        <input type="date" name="dataInicio" value={filters.dataInicio} onChange={handleFilterChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm"/>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700">Data Fim (até)</label>
                        <input type="date" name="dataFim" value={filters.dataFim} onChange={handleFilterChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm"/>
                    </div>
                    <div className="flex items-end col-span-full justify-between mt-4">
                        <div>
                            <button onClick={handleSearch} className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark">
                                Gerar Relatório
                            </button>
                            <button onClick={clearFilters} className="ml-2 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Limpar
                            </button>
                        </div>
                        <div className="flex items-end space-x-2">
                            <button onClick={handleExportExcel} className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                                Exportar Excel
                            </button>
                            <button onClick={handleExportPdf} className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                                Exportar PDF
                            </button>
                        </div>
                    </div>
                 </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="bg-white rounded-lg shadow-md overflow-y-auto h-full">
                    {isLoading ? (
                        <div className="text-center py-16">Carregando dados...</div>
                    ) : error ? (
                        <div className="text-center py-16 text-red-600">Erro: {error}</div>
                    ) : searched ? (
                        <> 
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servidor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carga Horária</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Início</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Fim</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredData.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.servidor}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.evento}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.carga_horaria}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.data_inicio).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.data_termino).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredData.length === 0 && (
                                <div className="text-center py-16">
                                    <p className="text-gray-500">Nenhum resultado encontrado para os filtros aplicados.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-gray-500">Insira os parâmetros e clique em "Gerar Relatório" para visualizar os dados.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Relatorios;