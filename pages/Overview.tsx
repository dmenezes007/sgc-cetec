import React, { useMemo, useState, useEffect } from 'react';
import { Capacitacao } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-dark-text mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-2">{description}</p>
    </div>
);

const Overview: React.FC = () => {
    const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filtros
    const [filterAno, setFilterAno] = useState<string>('');
    const [filterServidor, setFilterServidor] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');

    useEffect(() => {
        const fetchCapacitacoes = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/capacitacoes');
                if (!response.ok) {
                    throw new Error('Falha ao buscar dados para o overview');
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

    const filteredCapacitacoes = useMemo(() => {
        return capacitacoes.filter(c => {
            const anoMatch = filterAno ? c.ano.toString() === filterAno : true;
            const servidorMatch = filterServidor ? c.servidor.toLowerCase().includes(filterServidor.toLowerCase()) : true;
            const statusMatch = filterStatus ? c.status === filterStatus : true;
            return anoMatch && servidorMatch && statusMatch;
        });
    }, [capacitacoes, filterAno, filterServidor, filterStatus]);

    const stats = useMemo(() => {
        const totalCapacitacoes = filteredCapacitacoes.length;
        const cargaHorariaTotal = filteredCapacitacoes.reduce((acc, curr) => {
            const cargaHoraria = parseFloat(String(curr.carga_horaria).replace(',', '.'));
            return acc + (isNaN(cargaHoraria) ? 0 : cargaHoraria);
        }, 0);
        const totalServidores = new Set(filteredCapacitacoes.map(c => c.servidor)).size;
        const totalInstituicoes = new Set(filteredCapacitacoes.map(c => c.instituicao_promotora)).size;
        
        return { totalCapacitacoes, cargaHorariaTotal, totalServidores, totalInstituicoes };
    }, [filteredCapacitacoes]);

    const paginatedCapacitacoes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCapacitacoes.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCapacitacoes, currentPage]);

    const capacitacoesPorMes = useMemo(() => {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const data = meses.map(mes => ({ name: mes, total: 0 }));
        filteredCapacitacoes.forEach(c => {
            const mesIndex = new Date(c.data_inicio).getMonth();
            if(data[mesIndex]) data[mesIndex].total++;
        });
        return data;
    }, [filteredCapacitacoes]);

    const statusData = useMemo(() => {
        const statusCounts = filteredCapacitacoes.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [filteredCapacitacoes]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    if (isLoading) {
        return <div className="text-center py-16">Carregando overview...</div>;
    }

    if (error) {
        return <div className="text-center py-16 text-red-600">Erro: {error}</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-dark-text mb-6">Overview</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-dark-text mb-4">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Filtrar por Ano..." value={filterAno} onChange={e => setFilterAno(e.target.value)} className="p-2 border rounded" />
                    <input type="text" placeholder="Filtrar por Pesquisador..." value={filterServidor} onChange={e => setFilterServidor(e.target.value)} className="p-2 border rounded" />
                    <input type="text" placeholder="Filtrar por Status..." value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 border rounded" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total de Capacitações" value={stats.totalCapacitacoes} description="Registros totais no sistema" />
                <StatCard title="Carga Horária Total" value={`${stats.cargaHorariaTotal.toFixed(2)}h`} description="Soma de todas as horas de curso" />
                <StatCard title="Total de Servidores" value={stats.totalServidores} description="Número de servidores únicos" />
                <StatCard title="Total de Instituições" value={stats.totalInstituicoes} description="Número de instituições promotoras únicas" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-dark-text mb-4">Capacitações por Mês</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={capacitacoesPorMes}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-dark-text mb-4">Distribuição por Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
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
                                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{(currentPage - 1) * itemsPerPage + paginatedCapacitacoes.length}</span> of <span className="font-medium">{filteredCapacitacoes.length}</span> results
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

export default Overview;