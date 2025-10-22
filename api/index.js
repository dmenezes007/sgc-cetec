const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const { Pool } = require('pg');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'https://sgc-cetec.vercel.app']
}));
app.use(bodyParser.json());

// Substitua pela sua string de conexão do PostgreSQL
const connectionString = process.env.POSTGRES_URL || 'postgres://user:password@host:port/database';

const pool = new Pool({
    connectionString,
});

const csvFilePath = path.resolve(__dirname, '..', 'files', 'docs', 'base_de_dados_completa.csv');

async function initializeDatabase() {
    const client = await pool.connect();
    try {
        // Verifica se a tabela já existe
        const res = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'capacitacoes'
            );
        `);

        if (res.rows[0].exists) {
            console.log('Table capacitacoes already exists.');
            return;
        }

        console.log('Table does not exist. Starting migration...');
        
        await client.query(`
            CREATE TABLE capacitacoes (
                id SERIAL PRIMARY KEY,
                ano INTEGER, servidor TEXT, cargo_de_chefia TEXT, matricula REAL, coord_geral TEXT, uorg TEXT, base_maiuscula TEXT,
                evento TEXT, status TEXT, carga_horaria INTEGER, instituicao_promotora TEXT, cnpjcpf TEXT, modalidade TEXT,
                linha_de_capacitacao TEXT, programa_interno_cetec TEXT, data_inicio TEXT, data_termino TEXT, mes TEXT,
                iniciativa TEXT, devolutiva_pdp TEXT, gratuito_ou_pago TEXT, valor_evento REAL, valor_diaria REAL,
                valor_passagem REAL, com_ou_sem_afastamento TEXT
            )
        `);
        console.log('Created capacitacoes table.');

        const rows = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv.parse({ headers: true, delimiter: ';' }))
            .on('error', (error) => {
                console.error('Error parsing CSV:', error);
            })
            .on('data', (row) => rows.push(row))
            .on('end', async () => {
                console.log(`Parsed ${rows.length} rows`);
                
                const query = `
                    INSERT INTO capacitacoes (
                        ano, servidor, cargo_de_chefia, matricula, coord_geral, uorg, base_maiuscula,
                        evento, status, carga_horaria, instituicao_promotora, cnpjcpf, modalidade,
                        linha_de_capacitacao, programa_interno_cetec, data_inicio, data_termino, mes,
                        iniciativa, devolutiva_pdp, gratuito_ou_pago, valor_evento, valor_diaria,
                        valor_passagem, com_ou_sem_afastamento
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
                `;

                for (const row of rows) {
                    await client.query(query, Object.values(row));
                }
                
                console.log('Finished inserting data.');
            });
    } finally {
        client.release();
    }
}

initializeDatabase().catch(err => console.error('Failed to initialize database:', err));

app.get('/api/capacitacoes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM capacitacoes');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.post('/api/capacitacoes', async (req, res) => {
    const newTraining = req.body;
    const query = `
        INSERT INTO capacitacoes (
            ano, servidor, cargo_de_chefia, matricula, coord_geral, uorg, base_maiuscula,
            evento, status, carga_horaria, instituicao_promotora, cnpjcpf, modalidade,
            linha_de_capacitacao, programa_interno_cetec, data_inicio, data_termino, mes,
            iniciativa, devolutiva_pdp, gratuito_ou_pago, valor_evento, valor_diaria,
            valor_passagem, com_ou_sem_afastamento
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        RETURNING id;
    `;
    const values = [
        newTraining.ano, newTraining.servidor, newTraining.cargo_de_chefia, newTraining.matricula,
        newTraining.coord_geral, newTraining.uorg, newTraining.base_maiuscula, newTraining.evento,
        newTraining.status, newTraining.carga_horaria, newTraining.instituicao_promotora,
        newTraining.cnpjcpf, newTraining.modalidade, newTraining.linha_de_capacitacao,
        newTraining.programa_interno_cetec, newTraining.data_inicio, newTraining.data_termino,
        newTraining.mes, newTraining.iniciativa, newTraining.devolutiva_pdp,
        newTraining.gratuito_ou_pago, newTraining.valor_evento, newTraining.valor_diaria,
        newTraining.valor_passagem, newTraining.com_ou_sem_afastamento
    ];

    try {
        const result = await pool.query(query, values);
        res.status(201).send({ id: result.rows[0].id, ...newTraining });
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

module.exports = app;
