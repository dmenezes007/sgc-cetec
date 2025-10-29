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
        backgroundColor: '#1e293b', // bg-slate-800
        borderColor: '#475569', // border-slate-600
        color: 'white',
        borderRadius: '0.375rem', // rounded-md
        padding: '0.1rem',
        border: '1px solid #475569',
        boxShadow: 'none',
        '&:hover': {
            borderColor: '#94a3b8', // border-slate-400
        },
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: 'white',
    }),
    menu: (provided: any) => ({
        ...provided,
        backgroundColor: '#1e293b', // bg-slate-800
        borderColor: '#334155', // border-slate-700
        zIndex: 50
    }),
    option: (provided: any, state: { isFocused: any; isSelected: any; }) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#334155' : state.isSelected ? '#2563eb' : '#1e293b',
        color: 'white',
        '&:active': {
            backgroundColor: '#2563eb',
            color: 'white'
        },
    }),
    input: (provided: any) => ({
        ...provided,
        color: 'white',
    }),
    placeholder: (provided: any) => ({
        ...provided,
        color: '#94a3b8', // text-slate-400
    }),
};

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
};

const formatCurrency = (value: any) => {
    const num = parseFloat(String(value).replace(',', '.'));
    if (isNaN(num)) {
        return 'R$ 0,00';
    }
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
    <div className="bg-slate-800 p-6 rounded-lg shadow-md border-l-4 border-primary">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        <p className="text-xs text-gray-300 mt-2">{description}</p>
    </div>
);

const SearchableDropdown: React.FC<{ options: string[]; value: string; onChange: (value: string) => void; placeholder: string; label: string; }> = ({ options, value, onChange, placeholder, label }) => {
    const selectOptions = useMemo(() =>
        options.map(opt => ({ value: opt, label: opt || "" })),
    [options]);

    const selectedValue = useMemo(() =>
        selectOptions.find(opt => opt.value === value) || null,
    [selectOptions, value]);

    const handleChange = (option: SingleValue<SelectOption>) => {
        onChange(option ? option.value : '');
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
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
        </div>
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

    const uniqueAnos = useMemo(() => ['', ...Array.from(new Set(capacitacoes.filter(c => c && c.ano).map(c => c.ano.toString()))).sort((a, b) => b.localeCompare(a))], [capacitacoes]);
    const uniqueServidores = useMemo(() => ['', ...Array.from(new Set(capacitacoes.map(c => c.servidor))).sort((a, b) => a.localeCompare(b))], [capacitacoes]);
    const uniqueInstituicoes = useMemo(() => {
        const instituicoes = Array.from(new Set(capacitacoes.map(c => c.instituicao_promotora)));
        return ['', ...instituicoes.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }))];
    }, [capacitacoes]);

    const filteredCapacitacoes = useMemo(() => {
        return capacitacoes.filter(c => {
            const anoMatch = filterAno ? String(c.ano) === filterAno : true;
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
        return <div className="text-center py-16">Carregando Dados...</div>;
    }

    if (error) {
        return <div className="text-center py-16 text-red-600">Erro: {error}</div>;
    }

    return (
        <div style={{fontFamily: 'Open Sans, sans-serif'}}>
            <h2 className="text-3xl font-bold text-white mb-6">Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total de Capacitações" value={formatNumber(stats.totalCapacitacoes)} description="Registros totais no sistema" />
                <StatCard title="Carga Horária Total" value={`${stats.cargaHorariaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}h`} description="Soma de todas as horas de curso" />
                <StatCard title="Total de Servidores" value={formatNumber(stats.totalServidores)} description="Número de servidores únicos" />
                <StatCard title="Total de Instituições" value={formatNumber(stats.totalInstituicoes)} description="Número de instituições promotoras únicas" />
            </div>

            <div className="bg-slate-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SearchableDropdown options={uniqueAnos} value={filterAno} onChange={setFilterAno} placeholder="Filtrar por Ano..." label="Ano" />
                    <SearchableDropdown options={uniqueServidores} value={filterServidor} onChange={setFilterServidor} placeholder="Filtrar por Servidor..." label="Servidor" />
                    <SearchableDropdown options={uniqueInstituicoes} value={filterInstituicao} onChange={setFilterInstituicao} placeholder="Filtrar por Instituição..." label="Instituição" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4">Capacitações por Ano</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={capacitacoesPorAno} style={{fontFamily: 'Open Sans, sans-serif'}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} cursor={{ fill: 'rgba(204, 204, 204, 0.5)' }} />
                            <Bar dataKey="total" fill="#2563EB" fillOpacity={0.75} stroke="#2563EB" strokeOpacity={1} activeBar={{ fillOpacity: 0.5 }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4">Capacitações por Mês</h3>
                    <ResponsiveContainer width="100%" height={300}>
<Bar dataKey="total" fill="#2563EB" fillOpacity={0.75} stroke="#2563EB" strokeOpacity={1} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-white mb-4">Capacitações</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700 table-fixed w-full">
                        <thead className="bg-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6">Servidor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4">Evento</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6">Instituição</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Carga Horária</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Início</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Fim</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Modalidade</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-800 divide-y divide-slate-700">
                            {paginatedCapacitacoes.map((capacitacao) => (
                                <Fragment key={capacitacao.id}>
                                    <tr onClick={() => handleRowClick(capacitacao.id)} className="hover:bg-slate-700 cursor-pointer">
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white">{capacitacao.servidor}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white">{capacitacao.evento}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white text-center">{capacitacao.instituicao_promotora.toUpperCase()}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white text-center">{capacitacao.carga_horaria}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white text-center">{capacitacao.data_inicio}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white text-center">{capacitacao.data_termino}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white">{capacitacao.modalidade}</td>
                                    </tr>
                                    {expandedRowId === capacitacao.id && (
                                        <tr className="bg-slate-700">
                                            <td colSpan={7} className="p-4">
                                                <div className="grid grid-cols-3 gap-4 text-sm text-white">
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
                                                    <div><strong>Valor do Evento:</strong> {formatCurrency(capacitacao.valor_evento)}</div>
                                                    <div><strong>Valor da Diária:</strong> {formatCurrency(capacitacao.valor_diaria)}</div>
                                                    <div><strong>Valor da Passagem:</strong> {formatCurrency(capacitacao.valor_passagem)}</div>
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
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-gray-300 bg-slate-800 hover:bg-slate-700"> Previous </button>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={paginatedCapacitacoes.length < itemsPerPage} className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-gray-300 bg-slate-800 hover:bg-slate-700"> Next </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-300">
                                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{(currentPage - 1) * itemsPerPage + paginatedCapacitacoes.length}</span> of <span className="font-medium">{filteredCapacitacoes.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-600 bg-slate-800 text-sm font-medium text-gray-400 hover:bg-slate-700"> <span className="sr-only">Previous</span> &lt; </button>
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={paginatedCapacitacoes.length < itemsPerPage} className="-ml-px relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-600 bg-slate-800 text-sm font-medium text-gray-400 hover:bg-slate-700"> <span className="sr-only">Next</span> &gt; </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
y-2 rounded-l-md border border-slate-600 bg-slate-800 text-sm font-medium text-gray-400 hover:bg-slate-700"> <span className="sr-only">Previous</span> &lt; </button>
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={paginatedCapacitacoes.length < itemsPerPage} className="-ml-px relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-600 bg-slate-800 text-sm font-medium text-gray-400 hover:bg-slate-700"> <span className="sr-only">Next</span> &gt; </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
