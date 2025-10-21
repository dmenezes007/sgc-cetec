const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const sqlite3 = require('sqlite3').verbose();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'https://sgc-cetec.vercel.app']
}));
app.use(bodyParser.json());

const dbPath = path.resolve('/tmp', 'database.db');
const csvFilePath = path.resolve(__dirname, '..', 'files', 'docs', 'base_de_dados_completa.csv');

let db;

function initializeDatabase(callback) {
    if (fs.existsSync(dbPath)) {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) return callback(err);
            console.log('Connected to existing SQLite database.');
            callback(null);
        });
        return;
    }

    console.log('Database does not exist. Starting migration...');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) return callback(err);
        console.log('Connected to new SQLite database.');

        db.serialize(() => {
            db.run(`CREATE TABLE capacitacoes (
                ano INTEGER, servidor TEXT, cargo_de_chefia TEXT, matricula REAL, coord_geral TEXT, uorg TEXT, base_maiuscula TEXT,
                evento TEXT, status TEXT, carga_horaria INTEGER, instituicao_promotora TEXT, cnpjcpf TEXT, modalidade TEXT,
                linha_de_capacitacao TEXT, programa_interno_cetec TEXT, data_inicio TEXT, data_termino TEXT, mes TEXT,
                iniciativa TEXT, devolutiva_pdp TEXT, gratuito_ou_pago TEXT, valor_evento REAL, valor_diaria REAL,
                valor_passagem REAL, com_ou_sem_afastamento TEXT
            )`, (err) => {
                if (err) return callback(err);
                console.log('Created capacitacoes table.');

                const rows = [];
                fs.createReadStream(csvFilePath)
                    .pipe(csv.parse({ headers: true, delimiter: ';' }))
                    .on('error', callback)
                    .on('data', row => rows.push(row))
                    .on('end', () => {
                        console.log(`Parsed ${rows.length} rows`);
                        const stmt = db.prepare(`INSERT INTO capacitacoes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                        db.parallelize(() => {
                            for (const row of rows) {
                                stmt.run(Object.values(row));
                            }
                        });
                        stmt.finalize((err) => {
                            if (err) return callback(err);
                            console.log('Finished inserting data.');
                            callback(null);
                        });
                    });
            });
        });
    });
}

app.use((req, res, next) => {
    if (db) return next();
    initializeDatabase((err) => {
        if (err) {
            console.error('Failed to initialize database:', err);
            return res.status(500).send('Failed to initialize database.');
        }
        next();
    });
});

app.get('/api/capacitacoes', (req, res) => {
    db.all('SELECT rowid as id, * FROM capacitacoes', [], (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/capacitacoes', (req, res) => {
    const newTraining = req.body;
    const stmt = db.prepare(`INSERT INTO capacitacoes (
        ano, servidor, cargo_de_chefia, matricula, coord_geral, uorg, base_maiuscula,
        evento, status, carga_horaria, instituicao_promotora, cnpjcpf, modalidade,
        linha_de_capacitacao, programa_interno_cetec, data_inicio, data_termino, mes,
        iniciativa, devolutiva_pdp, gratuito_ou_pago, valor_evento, valor_diaria,
        valor_passagem, com_ou_sem_afastamento
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    stmt.run([
        newTraining.ano, newTraining.servidor, newTraining.cargo_de_chefia, newTraining.matricula,
        newTraining.coord_geral, newTraining.uorg, newTraining.base_maiuscula, newTraining.evento,
        newTraining.status, newTraining.carga_horaria, newTraining.instituicao_promotora,
        newTraining.cnpjcpf, newTraining.modalidade, newTraining.linha_de_capacitacao,
        newTraining.programa_interno_cetec, newTraining.data_inicio, newTraining.data_termino,
        newTraining.mes, newTraining.iniciativa, newTraining.devolutiva_pdp,
        newTraining.gratuito_ou_pago, newTraining.valor_evento, newTraining.valor_diaria,
        newTraining.valor_passagem, newTraining.com_ou_sem_afastamento
    ], function(err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.status(201).send({ id: this.lastID, ...newTraining });
    });
    stmt.finalize();
});

module.exports = app;