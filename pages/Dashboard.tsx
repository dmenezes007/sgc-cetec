
import React, { useMemo, useState, useEffect } from 'react';
import { Capacitacao } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-dark-text mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-2">{description}</p>
    </div>
);

const Dashboard: React.FC = () => {
    const [capacitacoes, setCapacitacoes] = useState<Capacitacao[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCapacitacoes = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/capacitacoes');
                if (!response.ok) {
                    throw new Error('Falha ao buscar dados para o dashboard');
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

    const stats = useMemo(() => {
        const totalCapacitacoes = capacitacoes.length;
        const cargaHorariaTotal = capacitacoes.reduce((acc, curr) => acc + Number(curr.carga_horaria || 0), 0);
        
        return { totalCapacitacoes, cargaHorariaTotal };
    }, [capacitacoes]);

    if (isLoading) {
        return <div className="text-center py-16">Carregando dashboard...</div>;
    }

    if (error) {
        return <div className="text-center py-16 text-red-600">Erro: {error}</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-dark-text mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total de Capacitações" value={stats.totalCapacitacoes} description="Registros totais no sistema" />
                <StatCard title="Carga Horária Total" value={`${stats.cargaHorariaTotal}h`} description="Soma de todas as horas de curso" />
            </div>
        </div>
    );
};

export default Dashboard;
