
import React, { useState, useMemo } from 'react';
import { MOCK_CAPACITACOES } from '../lib/mockData';
import { Capacitacao } from '../types';

const Relatorios: React.FC = () => {
    const [filters, setFilters] = useState({
        termo: '',
        uorg: '',
        status: '',
        dataInicio: '',
        dataFim: '',
    });

    const filteredData = useMemo(() => {
        return MOCK_CAPACITACOES.filter(item => {
            const termoMatch = filters.termo.toLowerCase() === '' ||
                item.servidor.toLowerCase().includes(filters.termo.toLowerCase()) ||
                item.evento.toLowerCase().includes(filters.termo.toLowerCase());

            const uorgMatch = filters.uorg === '' || item.uorg === filters.uorg;
            const statusMatch = filters.status === '' || item.status === filters.status;
            
            const dataInicioMatch = filters.dataInicio === '' || item.data_inicio >= filters.dataInicio;
            const dataFimMatch = filters.dataFim === '' || item.data_inicio <= filters.dataFim;


            return termoMatch && uorgMatch && statusMatch && dataInicioMatch && dataFimMatch;
        });
    }, [filters]);
    
    const uorgsUnicas = [...new Set(MOCK_CAPACITACOES.map(item => item.uorg))];

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-3xl font-bold text-dark-text mb-6">Relatórios de Capacitações</h2>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Buscar por Servidor ou Evento</label>
                        <input type="text" name="termo" value={filters.termo} onChange={handleFilterChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">UORG</label>
                        <select name="uorg" value={filters.uorg} onChange={handleFilterChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm">
                            <option value="">Todas</option>
                            {uorgsUnicas.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="mt-1 w-full rounded-md border-gray-300 shadow-sm">
                            <option value="">Todos</option>
                            <option>Concluído</option>
                            <option>Em andamento</option>
                            <option>Pendente</option>
                            <option>Cancelado</option>
                        </select>
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
                         <button className="py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servidor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UORG</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Início</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.servidor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{item.evento}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.uorg}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            item.status === 'Concluído' ? 'bg-green-100 text-green-800' : 
                                            item.status === 'Em andamento' ? 'bg-yellow-100 text-yellow-800' :
                                            item.status === 'Pendente' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.data_inicio).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
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
