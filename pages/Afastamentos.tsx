
import React, { useMemo, useState, useEffect, Fragment } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Select, { SingleValue } from 'react-select';
import Papa from 'papaparse';

interface Afastamento {
    Servidor: string;
    'Data Inicio': string;
    'Data Fim': string;
    Local: string;
    Latitude: number;
    Longitude: number;
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

const Afastamentos: React.FC = () => {
    const [afastamentos, setAfastamentos] = useState<Afastamento[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);
    const itemsPerPage = 10;

    // Filtros
    const [filterLocal, setFilterLocal] = useState<string>('');
    const [chartFilter, setChartFilter] = useState<string>('');

    const handleChartClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const newFilter = data.activePayload[0].payload.name;
            setChartFilter(prevFilter => (prevFilter === newFilter ? '' : newFilter));
        }
    };

    const handleRowClick = (index: number) => {
        setExpandedRowIndex(expandedRowIndex === index ? null : index);
    };

    useEffect(() => {
        const fetchAfastamentos = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/docs/afastamentos_com_coordenadas.csv');
                const text = await response.text();
                const result = await new Promise<Papa.ParseResult<Afastamento>>((resolve) => {
                    Papa.parse<Afastamento>(text, {
                        header: true,
                        delimiter: ';',
                        dynamicTyping: true,
                        skipEmptyLines: true,
                        complete: (results) => resolve(results),
                    });
                });
                const dataWithNumbers = result.data.map(row => ({
                    ...row,
                    Latitude: parseFloat(String(row.Latitude).replace(',', '.')),
                    Longitude: parseFloat(String(row.Longitude).replace(',', '.'))
                }));
                setAfastamentos(dataWithNumbers);
            } catch (err: any) {
                setError(err.toString());
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
            const chartMatch = chartFilter ? a.Local === chartFilter : true;
            return localMatch && chartMatch;
        });
    }, [afastamentos, filterLocal, chartFilter]);

    const paginatedAfastamentos = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAfastamentos.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAfastamentos, currentPage]);

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

    const afastamentosPorLocalComCoordenadas = useMemo(() => {
        const localData = filteredAfastamentos.reduce((acc, curr) => {
            const local = curr.Local;
            if (isFinite(curr.Latitude) && isFinite(curr.Longitude)) {
                if (!acc[local]) {
                    acc[local] = {
                        name: local,
                        total: 0,
                        latitude: curr.Latitude,
                        longitude: curr.Longitude
                    };
                }
                acc[local].total++;
            }
            return acc;
        }, {} as Record<string, { name: string; total: number; latitude: number, longitude: number }>);
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
                        <BarChart data={afastamentosPorLocal} style={{fontFamily: 'Open Sans, sans-serif'}} onClick={handleChartClick} barSize={80} barCategoryGap={30}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip isCurrency={false} />} cursor={{ fill: 'rgba(204, 204, 204, 0.5)' }} />
                            <Bar dataKey="total" fill="#2563EB" fillOpacity={0.75} stroke="#2563EB" strokeOpacity={1} barSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4">Mapa de Afastamentos</h3>
                    <MapContainer 
                        center={[20, 0]} 
                        zoom={2} 
                        style={{ width: "100%", height: "300px", zIndex: 0 }}
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        {afastamentosPorLocalComCoordenadas.map((local, i) => (
                            <CircleMarker
                                key={i}
                                center={[local.latitude, local.longitude]}
                                radius={5 + local.total * 2}
                                pathOptions={{ color: '#2563EB', fillColor: '#2563EB', fillOpacity: 0.5 }}
                            >
                                <Popup>
                                    {local.name}: {local.total} afastamento(s)
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg shadow-md mt-8">
                <h3 className="text-xl font-bold text-white mb-4">Afastamentos</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700 table-fixed w-full">
                        <thead className="bg-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4">Servidor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4">Local</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4">Início</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4">Fim</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-800 divide-y divide-slate-700">
                            {paginatedAfastamentos.map((afastamento, index) => (
                                <Fragment key={index}>
                                    <tr onClick={() => handleRowClick(index)} className="hover:bg-slate-700 cursor-pointer">
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white">{afastamento.Servidor}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white">{afastamento.Local}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white text-center">{afastamento['Data Inicio']}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-white text-center">{afastamento['Data Fim']}</td>
                                    </tr>
                                    {expandedRowIndex === index && (
                                        <tr className="bg-slate-700">
                                            <td colSpan={4} className="p-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm text-white">
                                                    <div><strong>Latitude:</strong> {afastamento.Latitude}</div>
                                                    <div><strong>Longitude:</strong> {afastamento.Longitude}</div>
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
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-gray-300 bg-slate-800 hover:bg-slate-700"> Anterior </button>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={paginatedAfastamentos.length < itemsPerPage} className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md text-gray-300 bg-slate-800 hover:bg-slate-700"> Próximo </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-300">
                                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{(currentPage - 1) * itemsPerPage + paginatedAfastamentos.length}</span> de <span className="font-medium">{filteredAfastamentos.length}</span> resultados
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-600 bg-slate-800 text-sm font-medium text-gray-400 hover:bg-slate-700"> <span className="sr-only">Anterior</span> &lt; </button>
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={paginatedAfastamentos.length < itemsPerPage} className="-ml-px relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-600 bg-slate-800 text-sm font-medium text-gray-400 hover:bg-slate-700"> <span className="sr-only">Próximo</span> &gt; </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Afastamentos;
