import React, { useMemo, useState, useEffect } from 'react';
import { Capacitacao } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const yAxisTickFormatter = (value: number) => {
    if (value === 0) return '';
    return formatNumber(value);
};

const yAxisCurrencyTickFormatter = (value: number) => {
    if (value === 0) return '';
    return formatCurrency(value);
};

const CustomTooltip = ({ active, payload, label, isCurrency }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-slate-800 border border-slate-700 rounded shadow-lg">
                <p className="label text-white">{`${label}`}</p>
                <p className="intro text-white">{isCurrency ? formatCurrency(payload[0].value) : formatNumber(payload[0].value)}</p>
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

const SearchableDropdown: React.FC<{ options: (string | number)[]; value: string; onChange: (value: string) => void; placeholder: string; label: string; }> = ({ options, value, onChange, placeholder, label }) => {
    const selectOptions = useMemo(() =>
        options.map(opt => ({ value: String(opt), label: String(opt) || "" })),
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

const Capacitacoes: React.FC = () => {
    const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtros
    const [filterLinha, setFilterLinha] = useState<string>('');
    const [filterAno, setFilterAno] = useState<string>('');
    const [filterValor, setFilterValor] = useState<string>('');

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

    const uniqueEvents = useMemo(() => {
        const events = new Map<string, Capacitacao>();
        capacitacoes.forEach(c => {
            const key = `${c.evento}-${c.ano}`;
            if (!events.has(key)) {
                events.set(key, c);
            }
        });
        return Array.from(events.values());
    }, [capacitacoes]);

    const uniqueLinhas = useMemo(() => ['', ...Array.from(new Set(capacitacoes.map(c => c.linha_de_capacitacao))).sort()], [capacitacoes]);
    const uniqueAnos = useMemo(() => ['', ...Array.from(new Set(capacitacoes.map(c => c.ano))).sort((a, b) => b - a)], [capacitacoes]);
    const uniqueValores = useMemo(() => {
        const valores = Array.from(new Set(uniqueEvents.map(c => c.valor_evento))).sort((a, b) => b - a);
        return ['', ...valores.map(v => formatCurrency(v))];
    }, [uniqueEvents]);


    const filteredCapacitacoes = useMemo(() => {
        return capacitacoes.filter(c => {
            const linhaMatch = filterLinha ? c.linha_de_capacitacao === filterLinha : true;
            const anoMatch = filterAno ? c.ano === parseInt(filterAno) : true;
            const valorMatch = filterValor ? formatCurrency(c.valor_evento) === filterValor : true;
            return linhaMatch && anoMatch && valorMatch;
        });
    }, [capacitacoes, filterLinha, filterAno, filterValor]);

    const filteredUniqueEvents = useMemo(() => {
        return uniqueEvents.filter(c => {
            const linhaMatch = filterLinha ? c.linha_de_capacitacao === filterLinha : true;
            const anoMatch = filterAno ? c.ano === parseInt(filterAno) : true;
            const valorMatch = filterValor ? formatCurrency(c.valor_evento) === filterValor : true;
            return linhaMatch && anoMatch && valorMatch;
        });
    }, [uniqueEvents, filterLinha, filterAno, filterValor]);

    const stats = useMemo(() => {
        const totalCapacitacoes = filteredCapacitacoes.length;
        const valorTotalEvento = filteredUniqueEvents.reduce((acc, curr) => acc + (Number(curr.valor_evento) || 0), 0);
        const valorTotalDiaria = filteredCapacitacoes.reduce((acc, curr) => acc + (Number(curr.valor_diaria) || 0), 0);
        const valorTotalPassagem = filteredCapacitacoes.reduce((acc, curr) => acc + (Number(curr.valor_passagem) || 0), 0);

        return { totalCapacitacoes, valorTotalEvento, valorTotalDiaria, valorTotalPassagem };
    }, [filteredCapacitacoes, filteredUniqueEvents]);

    const quantidadeEventosPorAno = useMemo(() => {
        const data = filteredUniqueEvents.reduce((acc, curr) => {
            const ano = curr.ano;
            if (ano >= 2017) {
                if (!acc[ano]) {
                    acc[ano] = { name: ano, quantidade: 0 };
                }
                acc[ano].quantidade++;
            }
            return acc;
        }, {} as Record<string, { name: number; quantidade: number }>);
        return Object.values(data).sort((a, b) => a.name - b.name);
    }, [filteredUniqueEvents]);

    const valorEventosPorAno = useMemo(() => {
        const data = filteredUniqueEvents.reduce((acc, curr) => {
            const ano = curr.ano;
            if (ano >= 2017) {
                if (!acc[ano]) {
                    acc[ano] = { name: ano, valor: 0 };
                }
                acc[ano].valor += (Number(curr.valor_evento) || 0);
            }
            return acc;
        }, {} as Record<string, { name: number; valor: number }>);
        return Object.values(data).sort((a, b) => a.name - b.name);
    }, [filteredUniqueEvents]);

    if (isLoading) {
        return <div className="text-center py-16">Carregando Dados...</div>;
    }

    if (error) {
        return <div className="text-center py-16 text-red-600">Erro: {error}</div>;
    }

    return (
        <div style={{fontFamily: 'Open Sans, sans-serif'}}>
            <h2 className="text-3xl font-bold text-white mb-6">Capacitações</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total de Capacitações" value={formatNumber(stats.totalCapacitacoes)} description="Registros totais no sistema" />
                <StatCard title="Valor Total Evento" value={formatCurrency(stats.valorTotalEvento)} description="Soma dos valores de eventos únicos" />
                <StatCard title="Valor Total Diária" value={formatCurrency(stats.valorTotalDiaria)} description="Soma de todos os valores de diária" />
                <StatCard title="Valor Total Passagem" value={formatCurrency(stats.valorTotalPassagem)} description="Soma de todos os valores de passagem" />
            </div>

            <div className="bg-slate-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SearchableDropdown options={uniqueLinhas} value={filterLinha} onChange={setFilterLinha} placeholder="Filtrar por Linha..." label="Linha de Capacitação" />
                    <SearchableDropdown options={uniqueAnos} value={filterAno} onChange={setFilterAno} placeholder="Filtrar por Ano..." label="Ano" />
                    <SearchableDropdown options={uniqueValores} value={filterValor} onChange={setFilterValor} placeholder="Filtrar por Valor..." label="Valor do Evento" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4">Quantidade de Eventos por Ano</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={quantidadeEventosPorAno} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorQuantidade" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                            <YAxis tick={{ fill: '#94a3b8' }} tickFormatter={yAxisTickFormatter} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="quantidade" stroke="#2563EB" strokeWidth={4} dot={false} fillOpacity={1} fill="url(#colorQuantidade)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4">Valor Total de Eventos por Ano</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={valorEventosPorAno} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                            <YAxis tick={{ fill: '#94a3b8' }} tickFormatter={yAxisCurrencyTickFormatter} />
                            <Tooltip content={<CustomTooltip isCurrency />} />
                            <Area type="monotone" dataKey="valor" stroke="#2563EB" strokeWidth={4} dot={false} fillOpacity={1} fill="url(#colorValor)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Capacitacoes;