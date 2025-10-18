const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, 'database.db');
const csvFilePath = path.resolve(__dirname, '..', 'files', 'docs', 'base_de_dados_completa.csv');

// Delete the database file if it exists
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
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
