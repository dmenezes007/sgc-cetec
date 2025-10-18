import React, { useState, useMemo, useEffect } from 'react';
import { Capacitacao } from '../types';

const Relatorios: React.FC = () => {
    const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        termo: '',
        dataInicio: '',
        dataFim: '',
    });

    useEffect(() => {
        const fetchCapacitacoes = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/capacitacoes');
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

        fetchCapacitacoes();
    }, []);

    const filteredData = useMemo(() => {
        return capacitacoes.filter(item => {
            const termoMatch = filters.termo.toLowerCase() === '' ||
                (item.nome_capacitacao && item.nome_capacitacao.toLowerCase().includes(filters.termo.toLowerCase())) ||
                (item.instrutor && item.instrutor.toLowerCase().includes(filters.termo.toLowerCase()));

            const dataInicioMatch = filters.dataInicio === '' || item.data_inicio >= filters.dataInicio;
            const dataFimMatch = filters.dataFim === '' || item.data_fim <= filters.dataFim;

            return termoMatch && dataInicioMatch && dataFimMatch;
        });
    }, [filters, capacitacoes]);

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
    };

    if (isLoading) {
        return <div className="text-center py-16">Carregando dados...</div>;
    }

    if (error) {
        return <div className="text-center py-16 text-red-600">Erro: {error}</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-3xl font-bold text-dark-text mb-6">Relatórios de Capacitações</h2>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Buscar por Nome ou Instrutor</label>
                        <input type="text" name="termo" value={filters.termo} onChange={handleFilterChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700">Data Início (a partir de)</label>
                        <input type="date" name="dataInicio" value={filters.dataInicio} onChange={handleFilterChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm"/>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700">Data Início (até)</label>
                        <input type="date" name="dataFim" value={filters.dataFim} onChange={handleFilterChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm"/>
                    </div>
                    <div className="flex items-end col-span-full md:col-span-2 justify-end space-x-2">
                         <button onClick={clearFilters} className="py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Limpar Filtros
                        </button>
                         <button className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                            Exportar Excel
                        </button>
                        <button className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                            Exportar PDF
                        </button>
                    </div>
                 </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="bg-white rounded-lg shadow-md overflow-x-auto h-full">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Capacitação</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instrutor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carga Horária</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Início</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Fim</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.nome_capacitacao}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.instrutor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.carga_horaria}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.data_inicio).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.data_fim).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredData.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-gray-500">Nenhum resultado encontrado para os filtros aplicados.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Relatorios;