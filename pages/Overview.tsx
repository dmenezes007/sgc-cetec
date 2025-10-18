import React, { useMemo, useState, useEffect } from 'react';
import { Capacitacao } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
};

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-dark-text mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-2">{description}</p>
    </div>
);

const SearchableDropdown: React.FC<{ options: string[]; value: string; onChange: (value: string) => void; placeholder: string; }> = ({ options, value, onChange, placeholder }) => {
    const [inputValue, setInputValue] = useState(value);
    const [showOptions, setShowOptions] = useState(false);

    const filteredOptions = useMemo(() => 
        options.filter(option => option.toLowerCase().includes(inputValue.toLowerCase())),
    [options, inputValue]);

    return (
        <div className="relative">
            <input 
                type="text" 
                placeholder={placeholder} 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onFocus={() => setShowOptions(true)}
                onBlur={() => setTimeout(() => setShowOptions(false), 100)}
                className="p-2 border rounded w-full"
            />
            {showOptions && (
                <ul className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-y-auto">
                    {filteredOptions.map(option => (
                        <li 
                            key={option}
                            onClick={() => {
                                onChange(option);
                                setInputValue(option);
                                setShowOptions(false);
                            }}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const Overview: React.FC = () => {
    const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filtros
    const [filterAno, setFilterAno] = useState<string>('');
    const [filterServidor, setFilterServidor] = useState<string>('');
    const [filterInstituicao, setFilterInstituicao] = useState<string>('');

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

    const uniqueAnos = useMemo(() => ['', ...Array.from(new Set(capacitacoes.map(c => c.ano.toString()))).sort((a, b) => b.localeCompare(a))], [capacitacoes]);
    const uniqueServidores = useMemo(() => ['', ...Array.from(new Set(capacitacoes.map(c => c.servidor))).sort((a, b) => a.localeCompare(b))], [capacitacoes]);
    const uniqueInstituicoes = useMemo(() => ['', ...Array.from(new Set(capacitacoes.map(c => c.instituicao_promotora))).sort((a, b) => a.localeCompare(b))], [capacitacoes]);

    const filteredCapacitacoes = useMemo(() => {
        const sorted = [...capacitacoes].sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime());
        return sorted.filter(c => {
            const anoMatch = filterAno ? c.ano.toString() === filterAno : true;
            const servidorMatch = filterServidor ? c.servidor === filterServidor : true;
            const instituicaoMatch = filterInstituicao ? c.instituicao_promotora === filterInstituicao : true;
            return anoMatch && servidorMatch && instituicaoMatch;
        });
    }, [capacitacoes, filterAno, filterServidor, filterInstituicao]);

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

    const capacitacoesPorAno = useMemo(() => {
        const yearCounts = filteredCapacitacoes.reduce((acc, curr) => {
            if(curr.ano && curr.ano.toString().trim() !== '') {
                acc[curr.ano] = (acc[curr.ano] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(yearCounts).map(([name, value]) => ({ name, total: value }));
    }, [filteredCapacitacoes]);

    const capacitacoesPorMes = useMemo(() => {
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const data = meses.map(mes => ({ name: mes, total: 0 }));
        filteredCapacitacoes.forEach(c => {
            const mesIndex = new Date(c.data_inicio).getMonth();
            if(data[mesIndex]) data[mesIndex].total++;
        });
        return data;
    }, [filteredCapacitacoes]);

    if (isLoading) {
        return <div className="text-center py-16">Carregando overview...</div>;
    }

    if (error) {
        return <div className="text-center py-16 text-red-600">Erro: {error}</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-dark-text mb-6">Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total de Capacitações" value={formatNumber(stats.totalCapacitacoes)} description="Registros totais no sistema" />
                <StatCard title="Carga Horária Total" value={`${formatNumber(stats.cargaHorariaTotal)}h`} description="Soma de todas as horas de curso" />
                <StatCard title="Total de Servidores" value={formatNumber(stats.totalServidores)} description="Número de servidores únicos" />
                <StatCard title="Total de Instituições" value={formatNumber(stats.totalInstituicoes)} description="Número de instituições promotoras únicas" />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-dark-text mb-4">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SearchableDropdown options={uniqueAnos} value={filterAno} onChange={setFilterAno} placeholder="Filtrar por Ano..." />
                    <SearchableDropdown options={uniqueServidores} value={filterServidor} onChange={setFilterServidor} placeholder="Filtrar por Servidor..." />
                    <SearchableDropdown options={uniqueInstituicoes} value={filterInstituicao} onChange={setFilterInstituicao} placeholder="Filtrar por Instituição..." />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-dark-text mb-4">Capacitações por Ano</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={capacitacoesPorAno}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="rgb(0 82 155)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-dark-text mb-4">Capacitações por Mês</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={capacitacoesPorMes}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="rgb(0 82 155)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-dark-text mb-4">Capacitações</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Servidor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Evento</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Instituição</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Carga Horária</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Início</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Fim</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Modalidade</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedCapacitacoes.map((capacitacao) => (
                                <tr key={capacitacao.id}>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{capacitacao.servidor}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{capacitacao.evento}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{capacitacao.instituicao_promotora}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{capacitacao.carga_horaria}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{capacitacao.data_inicio}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{capacitacao.data_termino}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{capacitacao.modalidade}</td>
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