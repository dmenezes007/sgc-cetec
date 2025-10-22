
// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config({ path: __dirname + '/.env' });

const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const { Pool } = require('pg');

// Verifica se a variável de ambiente foi carregada
if (!process.env.POSTGRES_URL) {
    console.error("ERRO: A variável POSTGRES_URL não foi definida.");
    console.error("Certifique-se de que o arquivo .env existe na pasta 'api' e contém a variável.");
    process.exit(1);
}

// Configura a conexão com o banco de dados
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

const csvFilePath = path.resolve(__dirname, '..', 'files', 'docs', 'base_de_dados_completa.csv');

async function resetDatabase() {
    const client = await pool.connect();
    try {
        console.log('Conectado ao banco de dados.');

        // 1. Apaga a tabela existente
        console.log('Apagando a tabela "capacitacoes" existente...');
        await client.query('DROP TABLE IF EXISTS capacitacoes;');
        console.log('Tabela "capacitacoes" apagada com sucesso.');

        // 2. Cria a tabela novamente
        console.log('Criando a nova tabela "capacitacoes"...');
        await client.query(
            `
            CREATE TABLE capacitacoes (
                id SERIAL PRIMARY KEY,
                ano INTEGER, servidor TEXT, cargo_de_chefia TEXT, matricula REAL, coord_geral TEXT, uorg TEXT, base_maiuscula TEXT,
                evento TEXT, status TEXT, carga_horaria INTEGER, instituicao_promotora TEXT, cnpjcpf TEXT, modalidade TEXT,
                linha_de_capacitacao TEXT, programa_interno_cetec TEXT, data_inicio TEXT, data_termino TEXT, mes TEXT,
                iniciativa TEXT, devolutiva_pdp TEXT, gratuito_ou_pago TEXT, valor_evento REAL, valor_diaria REAL,
                valor_passagem REAL, com_ou_sem_afastamento TEXT
            )
        `
        );
        console.log('Tabela "capacitacoes" criada com sucesso.');

        // 3. Lê o CSV e insere os dados
        console.log(`Lendo dados de ${path.basename(csvFilePath)}...`);
        const rows = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv.parse({ headers: true, delimiter: ';' }))
            .on('error', (error) => {
                console.error('Erro ao processar o arquivo CSV:', error);
                client.release();
                pool.end();
                process.exit(1);
            })
            .on('data', (row) => rows.push(row))
            .on('end', async () => {
                console.log(`${rows.length} linhas lidas do CSV.`);
                console.log('Iniciando a inserção dos dados...');

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
                    const values = Object.values(row);

                    // Indices for integer and real (float) columns based on the INSERT statement
                    const integerIndices = [0, 9]; // ano, carga_horaria
                    const realIndices = [3, 21, 22, 23]; // matricula, valor_evento, valor_diaria, valor_passagem

                    // Sanitize integer columns
                    integerIndices.forEach(index => {
                        const parsed = parseInt(values[index], 10);
                        values[index] = isNaN(parsed) ? null : parsed;
                    });

                    // Sanitize real columns
                    realIndices.forEach(index => {
                        // Replace comma with dot for decimal conversion
                        const value = typeof values[index] === 'string' ? values[index].replace(',', '.') : values[index];
                        const parsed = parseFloat(value);
                        values[index] = isNaN(parsed) ? null : parsed;
                    });

                    await client.query(query, values);
                }
                
                console.log('Inserção de dados finalizada.');
                console.log('Banco de dados resetado e recarregado com sucesso!');
                
                client.release();
                pool.end();
            });
    } catch (err) {
        console.error('Ocorreu um erro durante o reset do banco de dados:', err);
        client.release();
        pool.end();
        process.exit(1);
    }
}

resetDatabase();
