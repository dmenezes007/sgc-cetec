
import React, { useMemo } from 'react';
import { MOCK_CAPACITACOES } from '../lib/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-dark-text mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-2">{description}</p>
    </div>
);

const Dashboard: React.FC = () => {
    const stats = useMemo(() => {
        const totalCapacitacoes = MOCK_CAPACITACOES.length;
        const cargaHorariaTotal = MOCK_CAPACITACOES.reduce((acc, curr) => acc + curr.carga_horaria, 0);
        const servidoresAtendidos = new Set(MOCK_CAPACITACOES.map(c => c.matricula)).size;
        const investimentoTotal = MOCK_CAPACITACOES.reduce((acc, curr) => acc + curr.valor_evento, 0);
        
        return { totalCapacitacoes, cargaHorariaTotal, servidoresAtendidos, investimentoTotal };
    }, []);

    const dataByStatus = useMemo(() => {
        const statusCount = MOCK_CAPACITACOES.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(statusCount).map(([name, value]) => ({ name, quantidade: value }));
    }, []);

    return (
        <div>
            <h2 className="text-3xl font-bold text-dark-text mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total de Capacitações" value={stats.totalCapacitacoes} description="Registros totais no sistema" />
                <StatCard title="Carga Horária Total" value={`${stats.cargaHorariaTotal}h`} description="Soma de todas as horas de curso" />
                <StatCard title="Servidores Atendidos" value={stats.servidoresAtendidos} description="Número de matrículas únicas" />
                <StatCard title="Investimento Total" value={`R$ ${stats.investimentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} description="Soma dos valores dos eventos" />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-dark-text mb-4">Capacitações por Status</h3>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={dataByStatus}
                            margin={{
                                top: 5, right: 30, left: 20, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="quantidade" fill="#00529B" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
