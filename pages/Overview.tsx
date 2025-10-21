import React, { useMemo, useState, useEffect, Fragment } from 'react';
import { Capacitacao } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Select, { SingleValue } from 'react-select';

// Tipos e Estilos para o novo seletor
interface SelectOption {
    value: string;
    label: string;
}

const customStyles = {
    control: (provided: any) => ({
        ...provided,
        backgroundColor: 'white',
        borderColor: '#d1d5db', // border-gray-300
        color: 'black',
        borderRadius: '0.375rem', // rounded-md
        padding: '0.1rem',
        border: '1px solid #d1d5db',
        boxShadow: 'none',
        '&:hover': {
            borderColor: '#9ca3af', // border-gray-400
        },
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: 'black',
    }),
    menu: (provided: any) => ({
        ...provided,
        backgroundColor: 'white',
        borderColor: '#e5e7eb', // border-gray-200
        zIndex: 50
    }),
    option: (provided: any, state: { isFocused: any; isSelected: any; }) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#f3f4f6' : state.isSelected ? '#3b82f6' : 'white',
        color: state.isSelected ? 'white' : 'black',
        '&:active': {
            backgroundColor: '#3b82f6',
            color: 'white'
        },
    }),
    input: (provided: any) => ({
        ...provided,
        color: 'black',
    }),
    placeholder: (provided: any) => ({
        ...provided,
        color: '#6b7280', // text-gray-500
    }),
};

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
};

const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const parts = dateString.split('/');
    if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        return new Date(year, month - 1, day);
    }
    return null;
};

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-dark-text mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-2">{description}</p>
    </div>
);

const SearchableDropdown: React.FC<{ options: string[]; value: string; onChange: (value: string) => void; placeholder: string; }> = ({ options, value, onChange, placeholder }) => {
    const selectOptions = useMemo(() => 
        options.map(opt => ({ value: opt, label: opt || "(Vazio)" })), 
    [options]);

    const selectedValue = useMemo(() => 
        selectOptions.find(opt => opt.value === value) || null, 
    [selectOptions, value]);

    const handleChange = (option: SingleValue<SelectOption>) => {
        onChange(option ? option.value : '');
    };

    return (
        <Select
            instanceId={placeholder}
            value={selectedValue}
            onChange={handleChange}
            options={selectOptions}
            styles={customStyles}
            placeholder={placeholder}
            isClearable
            isSearchable
        />
    );
};

const Overview: React.FC = () => {
    const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const itemsPerPage = 10;

    // Filtros
    const [filterAno, setFilterAno] = useState<string>('');
    const [filterServidor, setFilterServidor] = useState<string>('');
    const [filterInstituicao, setFilterInstituicao] = useState<string>('');

    useEffect(() => {
        const fetchCapacitacoes = async () => {
            try {
                const response = await fetch(`/api/capacitacoes`);
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
    const uniqueInstituicoes = useMemo(() => {
        const instituicoes = Array.from(new Set(capacitacoes.map(c => c.instituicao_promotora)));
        return ['', ...instituicoes.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }))];
    }, [capacitacoes]);

    const filteredCapacitacoes = useMemo(() => {
        return capacitacoes.filter(c => {
            const anoMatch = filterAno ? c.ano.toString() === filterAno : true;
            const servidorMatch = filterServidor ? c.servidor === filterServidor : true;
            const instituicaoMatch = filterInstituicao ? c.instituicao_promotora === filterInstituicao : true;
            return anoMatch && servidorMatch && instituicaoMatch;
        }).sort((a, b) => {
            const dateA = parseDate(a.data_inicio) || parseDate(a.data_termino);
            const dateB = parseDate(b.data_inicio) || parseDate(b.data_termino);
            if (dateA && dateB) {
                return dateB.getTime() - dateA.getTime();
            }
            return 0;
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
            if(curr.ano && curr.ano >= 2017) {
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

    const handleRowClick = (id: number) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    if (isLoading) {
        return <div className="text-center py-16">Carregando overview...</div>;
    }

    if (error) {
        return <div className="text-center py-16 text-red-600">Erro: {error}</div>;
    }

    return (
        <div style={{fontFamily: 'Open Sans, sans-serif'}}>
            <h2 className="text-3xl font-bold text-dark-text mb-6">Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total de Capacitações" value={formatNumber(stats.totalCapacitacoes)} description="Registros totais no sistema" />
                <StatCard title="Carga Horária Total" value={`${stats.cargaHorariaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}h`} description="Soma de todas as horas de curso" />
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
                        <BarChart data={capacitacoesPorAno} style={{fontFamily: 'Open Sans, sans-serif'}}>
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.8}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="total" fill="url(#colorUv)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-dark-text mb-4">Capacitações por Mês</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={capacitacoesPorMes} style={{fontFamily: 'Open Sans, sans-serif'}}>
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.8}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="total" fill="url(#colorUv)" />
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
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Instituição</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Carga Horária</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Início</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Fim</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Modalidade</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedCapacitacoes.map((capacitacao) => (
                                <Fragment key={capacitacao.id}>
                                    <tr onClick={() => handleRowClick(capacitacao.id)} className="hover:bg-gray-50 cursor-pointer">
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{capacitacao.servidor}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{capacitacao.evento}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 text-center">{capacitacao.instituicao_promotora.toUpperCase()}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 text-center">{capacitacao.carga_horaria}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 text-center">{capacitacao.data_inicio}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 text-center">{capacitacao.data_termino}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{capacitacao.modalidade}</td>
                                    </tr>
                                    {expandedRowId === capacitacao.id && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={7} className="p-4">
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div><strong>Cargo de Chefia:</strong> {capacitacao.cargo_de_chefia}</div>
                                                    <div><strong>Matrícula:</strong> {capacitacao.matricula}</div>
                                                    <div><strong>Coord. Geral:</strong> {capacitacao.coord_geral}</div>
                                                    <div><strong>UORG:</strong> {capacitacao.uorg}</div>
                                                    <div><strong>Status:</strong> {capacitacao.status}</div>
                                                    <div><strong>Linha de Capacitação:</strong> {capacitacao.linha_de_capacitacao}</div>
                                                    <div><strong>Programa Interno CETEC:</strong> {capacitacao.programa_interno_cetec}</div>
                                                    <div><strong>Iniciativa:</strong> {capacitacao.iniciativa}</div>
                                                    <div><strong>Devolutiva PDP:</strong> {capacitacao.devolutiva_pdp}</div>
                                                    <div><strong>Gratuito ou Pago:</strong> {capacitacao.gratuito_ou_pago}</div>
                                                    <div><strong>Valor do Evento:</strong> {capacitacao.valor_evento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                                                    <div><strong>Valor da Diária:</strong> {capacitacao.valor_diaria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
<div><strong>Valor da Passagem:</strong> {capacitacao.valor_passagem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                                                    <div><strong>Com ou Sem Afastamento:</strong> {capacitacao.com_ou_sem_afastamento}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
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
