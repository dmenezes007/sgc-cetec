import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Select, { SingleValue } from 'react-select';
import Papa from 'papaparse';

interface Contratacao {
    Unidade: string;
    Evento: string;
    Inicio: string;
    Fim: string;
    Cidade: string;
    Status: string;
    Processo: string;
    Vagas: number;
    Observacoes: string;
    Autoriza_PR: string;
    Diarias: number;
    Passagens: number;
    Inscricoes: number;
    DFD: string;
    Custo: number;
    Envio_DIRAD: string;
    Detalhamento_DIORC: string;
    Total: number;
    TR: string;
    Analise_TR: string;
    Aprova_TR: string;
    Aprova_PR: string;
    Emprenho_DIRAD: string;
    Empenho_DIREF: string;
    Envio_Nota: string;
    Certificado: string;
    NF: string;
    Liquidacao: string;
    Encerramento: string;
}

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
    const num = parseFloat(String(value).replace('.', '').replace(',', '.'));
    if (isNaN(num)) {
        return 'R$ 0,00';
    }
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDecimal = (value: any) => {
    const num = parseFloat(String(value).replace('.', '').replace(',', '.'));
    if (isNaN(num)) {
        return '0,00';
    }
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const CustomTooltip = ({ active, payload, label, isCurrency }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-slate-800 border border-slate-700 rounded shadow-lg">
                <p className="label text-white">{`${label}`}</p>
                <p className="intro text-white">{isCurrency ? formatCurrency(payload[0].value) : formatDecimal(payload[0].value)}</p>
            </div>
        );
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

const Planejamento: React.FC = () => {
    const [contratacoes, setContratacoes] = useState<Contratacao[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
    const itemsPerPage = 10;

    // Filtros
    const [filterUnidade, setFilterUnidade] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [chartFilterUnidade, setChartFilterUnidade] = useState<string>('');

    const handleChartUnidadeClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const newFilter = data.activePayload[0].payload.name;
            setChartFilterUnidade(prevFilter => (prevFilter === newFilter ? '' : newFilter));
        }
    };

    const handleRowClick = (id: number) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };


    useEffect(() => {
        const fetchContratacoes = async () => {
            try {
                const response = await fetch('/docs/contratacoes-capacita.csv');
                const text = await response.text();
                const result = Papa.parse<Contratacao>(text, { header: true, delimiter: ';', dynamicTyping: true });
                setContratacoes(result.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContratacoes();
    }, []);

    const uniqueUnidades = useMemo(() => ['', ...Array.from(new Set(contratacoes.map(c => c.Unidade))).sort()], [contratacoes]);
    const uniqueStatus = useMemo(() => ['', ...Array.from(new Set(contratacoes.map(c => c.Status))).sort()], [contratacoes]);

    const filteredContratacoes = useMemo(() => {
        return contratacoes.filter(c => {
            const unidadeMatch = filterUnidade ? c.Unidade === filterUnidade : true;
            const statusMatch = filterStatus ? c.Status === filterStatus : true;
            const chartUnidadeMatch = chartFilterUnidade ? c.Unidade === chartFilterUnidade : true;
            return unidadeMatch && statusMatch && chartUnidadeMatch;
        });
    }, [contratacoes, filterUnidade, filterStatus, chartFilterUnidade]);

    const stats = useMemo(() => {
        const totalContratacoes = filteredContratacoes.length;
        const custoTotal = filteredContratacoes.reduce((acc, curr) => acc + curr.Custo, 0);
        const totalVagas = filteredContratacoes.reduce((acc, curr) => acc + curr.Vagas, 0);
        const mediaCustoPorVaga = totalVagas > 0 ? custoTotal / totalVagas : 0;

        return { totalContratacoes, custoTotal, totalVagas, mediaCustoPorVaga };
    }, [filteredContratacoes]);

    const custoPorUnidade = useMemo(() => {
        const unidadeData = filteredContratacoes.reduce((acc, curr) => {
            const unidade = curr.Unidade;
            if (!acc[unidade]) {
                acc[unidade] = { name: unidade, total: 0 };
            }
            acc[unidade].total += curr.Custo;
            return acc;
        }, {} as Record<string, { name: string; total: number }>);
        return Object.values(unidadeData);
    }, [filteredContratacoes]);

    const vagasPorUnidade = useMemo(() => {
        const unidadeData = filteredContratacoes.reduce((acc, curr) => {
            const unidade = curr.Unidade;
            if (!acc[unidade]) {
                acc[unidade] = { name: unidade, total: 0 };
            }
            acc[unidade].total += curr.Vagas;
            return acc;
        }, {} as Record<string, { name: string; total: number }>);
        return Object.values(unidadeData);
    }, [filteredContratacoes]);

    const paginatedContratacoes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredContratacoes.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredContratacoes, currentPage]);

    if (isLoading) {
        return <div className="text-center py-16">Carregando Dados...</div>;
    }

    if (error) {
        return <div className="text-center py-16 text-red-600">Erro: {error}</div>;
    }

    return (
        <div style={{fontFamily: 'Open Sans, sans-serif'}}>
            <h2 className="text-3xl font-bold text-white mb-6">Planejamento</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total de Contratações" value={formatDecimal(stats.totalContratacoes)} description="Registros totais no sistema" />
                <StatCard title="Custo Total" value={formatCurrency(stats.custoTotal)} description="Soma de todos os custos" />
                <StatCard title="Total de Vagas" value={formatDecimal(stats.totalVagas)} description="Soma de todas as vagas" />
                <StatCard title="Média de Custo por Vaga" value={formatCurrency(stats.mediaCustoPorVaga)} description="Média de custo por vaga" />
            </div>

            <div className="bg-slate-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SearchableDropdown options={uniqueUnidades} value={filterUnidade} onChange={setFilterUnidade} placeholder="Filtrar por Unidade..." label="Unidade" />
                    <SearchableDropdown options={uniqueStatus} value={filterStatus} onChange={setFilterStatus} placeholder="Filtrar por Status..." label="Status" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4">Custo por Unidade</h3>
                    <ResponsiveContainer width="100%" height={700}>
                        <BarChart data={custoPorUnidade} style={{fontFamily: 'Open Sans, sans-serif'}} onClick={handleChartUnidadeClick} barSize={80} barCategoryGap={40}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip isCurrency={true} />} cursor={{ fill: 'rgba(204, 204, 204, 0.5)' }} />
                            <Bar dataKey="total" fill="#2563EB" fillOpacity={0.75} stroke="#2563EB" strokeOpacity={1} barSize={80} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4">Vagas por Unidade</h3>
                    <ResponsiveContainer width="100%" height={700}>
                        <BarChart data={vagasPorUnidade} style={{fontFamily: 'Open Sans, sans-serif'}} onClick={handleChartUnidadeClick} barSize={80} barCategoryGap={40}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip isCurrency={false} />} cursor={{ fill: 'rgba(204, 204, 204, 0.5)' }} />
                            <Bar dataKey="total" fill="#2563EB" fillOpacity={0.75} stroke="#2563EB" strokeOpacity={1} barSize={80} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            <div className="bg-slate-800 p-6 rounded-lg shadow-md mt-8"> {/* Added mt-8 for spacing */}
                <h3 className="text-xl font-bold text-white mb-4">Contratações</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700 table-fixed w-full">
                        <thead className="bg-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6">Unidade</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4">Evento</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Início</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Fim</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Cidade</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Custo</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Vagas</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-800 divide-y divide-slate-700">
                            {paginatedContratacoes.map((contratacao, index) => (
                                <React.Fragment key={contratacao.Processo || index}> {/* Using Processo as key, fallback to index */}
                                    <tr onClick={() => handleRowClick(index)} className="hover:bg-slate-700 cursor-pointer"> {/* Using index as id for expandedRowId */}
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white">{contratacao.Unidade}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white">{contratacao.Evento}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white text-center">{contratacao.Inicio}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white text-center">{contratacao.Fim}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white">{contratacao.Cidade}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white">{contratacao.Status}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white text-right">{formatCurrency(contratacao.Custo)}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white text-right">{contratacao.Vagas}</td>
                                    </tr>
                                    {expandedRowId === index && (
                                        <tr className="bg-slate-700">
                                            <td colSpan={8} className="p-4">
                                                <div className="grid grid-cols-3 gap-4 text-sm text-white">
                                                    <div><strong>Processo:</strong> {contratacao.Processo}</div>
                                                    <div><strong>Observações:</strong> {contratacao.Observacoes}</div>
                                                    <div><strong>Autoriza PR:</strong> {contratacao.Autoriza_PR}</div>
                                                    <div><strong>Diárias:</strong> {formatCurrency(contratacao.Diarias)}</div>
                                                    <div><strong>Passagens:</strong> {formatCurrency(contratacao.Passagens)}</div>
                                                    <div><strong>Inscrições:</strong> {contratacao.Inscricoes}</div>
                                                    <div><strong>DFD:</strong> {contratacao.DFD}</div>
                                                    <div><strong>Envio DIRAD:</strong> {contratacao.Envio_DIRAD}</div>
                                                    <div><strong>Detalhamento DIORC:</strong> {contratacao.Detalhamento_DIORC}</div>
                                                    <div><strong>Total:</strong> {formatCurrency(contratacao.Total)}</div>
                                                    <div><strong>TR:</strong> {contratacao.TR}</div>
                                                    <div><strong>Análise TR:</strong> {contratacao.Analise_TR}</div>
                                                    <div><strong>Aprova TR:</strong> {contratacao.Aprova_TR}</div>
                                                    <div><strong>Aprova PR:</strong> {contratacao.Aprova_PR}</div>
                                                    <div><strong>Empenho DIRAD:</strong> {contratacao.Emprenho_DIRAD}</div>
                                                    <div><strong>Empenho DIREF:</strong> {contratacao.Empenho_DIREF}</div>
                                                    <div><strong>Envio Nota:</strong> {contratacao.Envio_Nota}</div>
                                                    <div><strong>Certificado:</strong> {contratacao.Certificado}</div>
                                                    <div><strong>NF:</strong> {contratacao.NF}</div>
                                                    <div><strong>Liquidação:</strong> {contratacao.Liquidacao}</div>
                                                    <div><strong>Encerramento:</strong> {contratacao.Encerramento}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="py-3 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-gray-300 bg-slate-800 hover:bg-slate-700"> Previous </button>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={paginatedContratacoes.length < itemsPerPage} className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-gray-300 bg-slate-800 hover:bg-slate-700"> Next </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-300">
                                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{(currentPage - 1) * itemsPerPage + paginatedContratacoes.length}</span> of <span className="font-medium">{filteredContratacoes.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-600 bg-slate-800 text-sm font-medium text-gray-400 hover:bg-slate-700"> <span className="sr-only">Previous</span> &lt; </button>
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={paginatedContratacoes.length < itemsPerPage} className="-ml-px relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-600 bg-slate-800 text-sm font-medium text-gray-400 hover:bg-slate-700"> <span className="sr-only">Next</span> &gt; </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Planejamento;

export default Planejamento;
