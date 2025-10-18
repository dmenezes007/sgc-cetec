import React, { useMemo, useState, useEffect } from 'react';
import { Capacitacao } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-dark-text mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-2">{description}</p>
    </div>
);

const Dashboard: React.FC = () => {
    const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchCapacitacoes = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/capacitacoes');
                if (!response.ok) {
                    throw new Error('Falha ao buscar dados para o dashboard');
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

    const stats = useMemo(() => {
        const totalCapacitacoes = capacitacoes.length;
        const cargaHorariaTotal = capacitacoes.reduce((acc, curr) => acc + Number(curr.carga_horaria || 0), 0);
        const totalServidores = new Set(capacitacoes.map(c => c.servidor)).size;
        const totalInstituicoes = new Set(capacitacoes.map(c => c.instituicao_promotora)).size;
        
        return { totalCapacitacoes, cargaHorariaTotal, totalServidores, totalInstituicoes };
    }, [capacitacoes]);

    const paginatedCapacitacoes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return capacitacoes.slice(startIndex, startIndex + itemsPerPage);
    }, [capacitacoes, currentPage]);

    if (isLoading) {
        return <div className="text-center py-16">Carregando dashboard...</div>;
    }

    if (error) {
        return <div className="text-center py-16 text-red-600">Erro: {error}</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-dark-text mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total de Capacitações" value={stats.totalCapacitacoes} description="Registros totais no sistema" />
                <StatCard title="Carga Horária Total" value={`${stats.cargaHorariaTotal}h`} description="Soma de todas as horas de curso" />
                <StatCard title="Total de Servidores" value={stats.totalServidores} description="Número de servidores únicos" />
                <StatCard title="Total de Instituições" value={stats.totalInstituicoes} description="Número de instituições promotoras únicas" />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-dark-text mb-4">Últimas Capacitações</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servidor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instituição</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carga Horária</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Início</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fim</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modalidade</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedCapacitacoes.map((capacitacao) => (
                                <tr key={capacitacao.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{capacitacao.servidor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{capacitacao.evento}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{capacitacao.instituicao_promotora}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{capacitacao.carga_horaria}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{capacitacao.data_inicio}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{capacitacao.data_termino}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{capacitacao.modalidade}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="py-3 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"> Previous </button>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={paginatedCapacitacoes.length < itemsPerPage} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"> Next </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{(currentPage - 1) * itemsPerPage + paginatedCapacitacoes.length}</span> of <span className="font-medium">{capacitacoes.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"> <span className="sr-only">Previous</span> &lt; </button>
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={paginatedCapacitacoes.length < itemsPerPage} className="-ml-px relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"> <span className="sr-only">Next</span> &gt; </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;