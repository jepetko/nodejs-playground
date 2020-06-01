const express = require('express');
const axios = require('axios');
const {chain} = require( 'stream-chain');
const {parser} = require( 'stream-json');
const {streamValues} = require( 'stream-json/streamers/StreamValues');
const {register, collectDefaultMetrics} = require('prom-client');

collectDefaultMetrics({ register });

const ax = axios.create({
    transformResponse: function (data) {
        return data;
    }
});

async function processStream(response) {
    return new Promise((resolve, reject) => {
        let fullResponse;
        const pipeline = chain([
            response.data,
            parser(),
            streamValues()
        ]);
        pipeline.on('data', data => fullResponse = data.value);
        pipeline.on('end', () => resolve(fullResponse));
        pipeline.on('error', () => reject());
    });
}

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
                const res = await ax.get('https://www.googleapis.com/books/v1/volumes?q=search+terms', {
                    responseType: 'stream'
                });
                const data = await processStream(res);
                console.info('read HTTP response: ', data.kind);
            } catch (e) {
                console.error(e.message);
            }
        }
        i++;
    }
    console.info('send response (http)');
    res.json({done: true, success, error});
});

s.use((err, req, res, next) => {
    console.error(500);
    res.status(500).json({message: 'error'});
});

s.listen(8080, () => {
    console.info('listening');
});

// metrics

const s2 = express();

s2.get('/metrics', (req, res) => {
    res.end(register.metrics());
});

s2.listen(9100, () => {
    console.info('listening on port 9100 (metrics)')
});
