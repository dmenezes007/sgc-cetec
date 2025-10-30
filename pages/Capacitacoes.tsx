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
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDecimal = (value: any) => {
    const num = parseFloat(String(value).replace(',', '.'));
    if (isNaN(num)) {
        return '0,00';
    }
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

const Capacitacoes: React.FC = () => {
    const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtros
    const [filterLinha, setFilterLinha] = useState<string>('');
    const [chartFilter, setChartFilter] = useState<string>('');

    const handleChartClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const newFilter = data.activePayload[0].payload.name;
            setChartFilter(prevFilter => (prevFilter === newFilter ? '' : newFilter));
        }
    };


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

    const uniqueLinhas = useMemo(() => ['', ...Array.from(new Set(capacitacoes.map(c => c.linha_de_capacitacao))).sort()], [capacitacoes]);

    const filteredCapacitacoes = useMemo(() => {
        return capacitacoes.filter(c => {
            const linhaMatch = filterLinha ? c.linha_de_capacitacao === filterLinha : true;
            const chartMatch = chartFilter ? c.linha_de_capacitacao === chartFilter : true;
            return linhaMatch && chartMatch;
        });
    }, [capacitacoes, filterLinha, chartFilter]);

    const stats = useMemo(() => {
        const totalCapacitacoes = filteredCapacitacoes.length;
        const valorTotalEvento = filteredCapacitacoes.reduce((acc, curr) => acc + curr.valor_evento, 0);
        const valorTotalDiaria = filteredCapacitacoes.reduce((acc, curr) => acc + curr.valor_diaria, 0);
        const valorTotalPassagem = filteredCapacitacoes.reduce((acc, curr) => acc + curr.valor_passagem, 0);

        return { totalCapacitacoes, valorTotalEvento, valorTotalDiaria, valorTotalPassagem };
    }, [filteredCapacitacoes]);

    const valorPorLinha = useMemo(() => {
        const linhaData = filteredCapacitacoes.reduce((acc, curr) => {
            const linha = curr.linha_de_capacitacao;
            if (!acc[linha]) {
                acc[linha] = { name: linha, total: 0 };
            }
            acc[linha].total += curr.valor_evento;
            return acc;
        }, {} as Record<string, { name: string; total: number }>);
        return Object.values(linhaData).sort((a, b) => b.total - a.total);
    }, [filteredCapacitacoes]);

    const quantidadePorLinha = useMemo(() => {
        const linhaData = filteredCapacitacoes.reduce((acc, curr) => {
            const linha = curr.linha_de_capacitacao;
            if (!acc[linha]) {
                acc[linha] = { name: linha, total: 0 };
            }
            acc[linha].total++;
            return acc;
        }, {} as Record<string, { name: string; total: number }>);
        return Object.values(linhaData).sort((a, b) => b.total - a.total);
    }, [filteredCapacitacoes]);

    if (isLoading) {
        return <div className="text-center py-16">Carregando Dados...</div>;
    }

    if (error) {
        return <div className="text-center py-16 text-red-600">Erro: {error}</div>;
    }

    return (
        <div style={{fontFamily: 'Open Sans, sans-serif'}}>
            <h2 className="text-3xl font-bold text-white mb-6">Capacitações</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StatCard title="Total de Capacitações" value={formatNumber(stats.totalCapacitacoes)} description="Registros totais no sistema" />
                <StatCard title="Valor Total Evento" value={formatCurrency(stats.valorTotalEvento)} description="Soma de todos os valores de evento" />
                <StatCard title="Valor Total Diária" value={formatCurrency(stats.valorTotalDiaria)} description="Soma de todos os valores de diária" />
                <StatCard title="Valor Total Passagem" value={formatCurrency(stats.valorTotalPassagem)} description="Soma de todos os valores de passagem" />
            </div>

            <div className="bg-slate-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Filtros</h3>
                <div className="grid grid-cols-1 gap-4">
                    <SearchableDropdown options={uniqueLinhas} value={filterLinha} onChange={setFilterLinha} placeholder="Filtrar por Linha de Capacitação..." label="Linha de Capacitação" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 mb-8">
                <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4">Valor por Linha de Capacitação</h3>
                    <ResponsiveContainer width="100%" height={500}>
                        <BarChart data={valorPorLinha} layout="vertical" style={{fontFamily: 'Open Sans, sans-serif'}} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} onClick={handleChartClick}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                            <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={300} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white' }} itemStyle={{ color: 'white' }} labelStyle={{ color: 'white' }} cursor={{ fill: 'rgba(204, 204, 204, 0.5)' }} />
                            <Bar dataKey="total" fill="#2563EB" fillOpacity={0.75} stroke="#2563EB" strokeOpacity={1} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4">Quantidade por Linha de Capacitação</h3>
                    <ResponsiveContainer width="100%" height={500}>
                        <BarChart data={quantidadePorLinha} layout="vertical" style={{fontFamily: 'Open Sans, sans-serif'}} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} onClick={handleChartClick}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                            <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={300} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white' }} itemStyle={{ color: 'white' }} labelStyle={{ color: 'white' }} cursor={{ fill: 'rgba(204, 204, 204, 0.5)' }} />
                            <Bar dataKey="total" fill="#2563EB" fillOpacity={0.75} stroke="#2563EB" strokeOpacity={1} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Capacitacoes;