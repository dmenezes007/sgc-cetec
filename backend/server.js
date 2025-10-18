const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const dbPath = path.resolve(__dirname, 'database.db');
const csvFilePath = path.resolve(__dirname, '..', 'files', 'docs', 'base_de_dados_completa.csv');

function migrateDatabase() {
    if (fs.existsSync(dbPath)) {
        console.log('Database already exists. Skipping migration.');
        return;
    }

    console.log('Database does not exist. Starting migration...');
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to the SQLite database.');
    });

    db.serialize(() => {
        db.run(`CREATE TABLE capacitacoes (
            ano INTEGER,
            servidor TEXT,
            cargo_de_chefia TEXT,
            matricula REAL,
            coord_geral TEXT,
            uorg TEXT,
            base_maiuscula TEXT,
            evento TEXT,
            status TEXT,
            carga_horaria INTEGER,
            instituicao_promotora TEXT,
            cnpjcpf TEXT,
            modalidade TEXT,
            linha_de_capacitacao TEXT,
            programa_interno_cetec TEXT,
            data_inicio TEXT,
            data_termino TEXT,
            mes TEXT,
            iniciativa TEXT,
            devolutiva_pdp TEXT,
            gratuito_ou_pago TEXT,
            valor_evento REAL,
            valor_diaria REAL,
            valor_passagem REAL,
            com_ou_sem_afastamento TEXT
        )`, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Created capacitacoes table.');

            const rows = [];
            fs.createReadStream(csvFilePath)
                .pipe(csv.parse({ headers: true, delimiter: ';' }))
                .on('error', error => console.error(error))
                .on('data', row => {
                    rows.push(row);
                })
                .on('end', rowCount => {
                    console.log(`Parsed ${rowCount} rows`);

                    const stmt = db.prepare(`INSERT INTO capacitacoes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

                    db.parallelize(() => {
                        for (const row of rows) {
                            stmt.run(Object.values(row));
                        }
                    });

                    stmt.finalize((err) => {
                        if (err) {
                            console.error('Error finalizing statement:', err.message);
                        } else {
                            console.log('Finished inserting data.');
                        }
                    });

                    db.close((err) => {
                        if (err) {
                            return console.error(err.message);
                        }
                        console.log('Close the database connection.');
                    });
                });
        });
    });
}

migrateDatabase();

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database for the server.');
});

// Endpoint to get all trainings
app.get('/api/capacitacoes', (req, res) => {
    db.all('SELECT rowid as id, * FROM capacitacoes', [], (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

// Endpoint to add a new training
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

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});