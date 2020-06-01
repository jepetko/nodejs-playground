const express = require('express');
const axios = require('axios');
const fs = require('fs');
const {register, collectDefaultMetrics} = require('prom-client');

collectDefaultMetrics({ register });

const ax = axios.create();

// app

const s = express();

s.get('/http', async (req, res) => {

    let count = +req.query.c;
    if (isNaN(count)) {
        count = 10;
    }

    let error = 0, success = 0;
    let i = 0;
    for(;;) {
        if (i === count) {
            break;
        } else {
            try {
                const res = await ax.get('https://www.googleapis.com/books/v1/volumes?q=search+terms');
                console.info('read HTTP response: ', res.data.kind);
                success++;
            } catch (e) {
                console.error(e.message);
                error++;
            }
        }
        i++;
    }
    console.info('send response (http)');
    res.json({done: true, success, error});
});

s.get('/file', (req, res) => {

    let count = +req.query.c;
    if (isNaN(count)) {
       count = 10;
    }

    let error = 0, success = 0;
    let i = 0;
    for(;;) {
        if (i === count) {
            break;
        } else {
            try {
                const bytes = fs.readFileSync('./files/big.txt');
                console.info('read file response: ', bytes.length);
                success++;
            } catch (e) {
                console.error(e.message);
                error++;
            }
        }
        i++;
    }
    console.info('send response (file)');
    res.json({done: true, success, error});
});

s.get('/health', (req, res) => {
    res.json({status: 'ok'});
});

s.use((err, req, res, next) => {
    console.error(500);
    res.status(500).json({message: 'error'});
});

s.listen(8080, () => {
    console.info('listening on port 8080 (app)');
});

// metrics

const s2 = express();

s2.get('/metrics', (req, res) => {
    res.end(register.metrics());
});

s2.listen(9100, () => {
    console.info('listening on port 9100 (metrics)')
});

