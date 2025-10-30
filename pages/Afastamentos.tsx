import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Select, { SingleValue } from 'react-select';
import * as XLSX from 'xlsx';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

interface Afastamento {
    Servidor: string;
    'Data Inicio': string;
    'Data Fim': string;
    Local: string;
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

const Afastamentos: React.FC = () => {
    const [afastamentos, setAfastamentos] = useState<Afastamento[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtros
    const [filterLocal, setFilterLocal] = useState<string>('');

    useEffect(() => {
        const fetchAfastamentos = async () => {
            try {
                const response = await fetch('/docs/afastamentos.xlsx');
                const ab = await response.arrayBuffer();
                const wb = XLSX.read(ab, { type: 'array', cellDates: true });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json<Afastamento>(ws);
                setAfastamentos(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAfastamentos();
    }, []);

    const uniqueLocais = useMemo(() => ['', ...Array.from(new Set(afastamentos.map(a => a.Local))).sort()], [afastamentos]);

    const filteredAfastamentos = useMemo(() => {
        return afastamentos.filter(a => {
            const localMatch = filterLocal ? a.Local === filterLocal : true;
            return localMatch;
        });
    }, [afastamentos, filterLocal]);

    const stats = useMemo(() => {
        const totalAfastamentos = filteredAfastamentos.length;
        const totalLocais = new Set(filteredAfastamentos.map(a => a.Local)).size;

        return { totalAfastamentos, totalLocais };
    }, [filteredAfastamentos]);

    const afastamentosPorLocal = useMemo(() => {
        const localData = filteredAfastamentos.reduce((acc, curr) => {
            const local = curr.Local;
            if (!acc[local]) {
                acc[local] = { name: local, total: 0 };
            }
            acc[local].total++;
            return acc;
        }, {} as Record<string, { name: string; total: number }>);
        return Object.values(localData);
    }, [filteredAfastamentos]);

    if (isLoading) {
        return <div className="text-center py-16">Carregando Dados...</div>;
    }

    if (error) {
        return <div className="text-center py-16 text-red-600">Erro: {error}</div>;
    }

    return (
        <div style={{fontFamily: 'Open Sans, sans-serif'}}>
            <h2 className="text-3xl font-bold text-white mb-6">Afastamentos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total de Afastamentos" value={formatDecimal(stats.totalAfastamentos)} description="Registros totais no sistema" />
                <StatCard title="Total de Locais" value={formatDecimal(stats.totalLocais)} description="Número de locais únicos" />
            </div>

            <div className="bg-slate-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SearchableDropdown options={uniqueLocais} value={filterLocal} onChange={setFilterLocal} placeholder="Filtrar por Local..." label="Local" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4">Afastamentos por Local</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={afastamentosPorLocal} style={{fontFamily: 'Open Sans, sans-serif'}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} cursor={{ fill: 'rgba(204, 204, 204, 0.5)' }} />
                            <Bar dataKey="total" fill="#2563EB" fillOpacity={0.75} stroke="#2563EB" strokeOpacity={1} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4">Mapa de Afastamentos</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 400, center: [-54, -15] }}>
                            <Geographies geography="https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson">
                                {({ geographies }) =>
                                    geographies.map(geo => <Geography key={geo.rsmKey} geography={geo} fill="#EAEAEC" stroke="#D6D6DA" />)
                                }
                            </Geographies>
                        </ComposableMap>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Afastamentos;
