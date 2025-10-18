const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const csvFilePath = path.resolve(__dirname, '..', 'files', 'docs', 'base_de_dados.csv');

// Endpoint to get all trainings
app.get('/api/capacitacoes', (req, res) => {
    const results = [];
    fs.createReadStream(csvFilePath)
        .pipe(csv.parse({ headers: true }))
        .on('error', error => res.status(500).send(error))
        .on('data', row => results.push(row))
        .on('end', () => res.json(results));
});

// Endpoint to add a new training
app.post('/api/capacitacoes', (req, res) => {
    const newTraining = req.body;
    const trainings = [];

    // Read the entire file to check for existing data and get the next ID
    fs.createReadStream(csvFilePath)
        .pipe(csv.parse({ headers: true }))
        .on('error', error => res.status(500).send(error))
        .on('data', row => trainings.push(row))
        .on('end', () => {
            const nextId = trainings.length > 0 ? Math.max(...trainings.map(t => parseInt(t.id) || 0)) + 1 : 1;
            newTraining.id = nextId;

            const ws = fs.createWriteStream(csvFilePath, { flags: 'a' });
            csv.write([newTraining], { headers: false, includeEndRowDelimiter: true })
                .pipe(ws)
                .on('finish', () => {
                    res.status(201).send(newTraining);
                });
        });
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
