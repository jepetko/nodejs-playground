const fs = require('fs');

function someAsyncOperation(callback) {
    const now = Date.now();
    fs.readFile('result.txt', () => {
        console.info(`file read took: ${Date.now() - now}ms`);
        callback().then(value => console.info(value));
    });
}

const timeoutScheduled = Date.now();

setTimeout(() => {
    const delay = Date.now() - timeoutScheduled;

    console.log(`${delay}ms have passed since I was scheduled`);
}, 100);

// do someAsyncOperation which takes 95 ms to complete
someAsyncOperation(async () => {

    let i = 0;
    for(;;) {
        if (i === 100) {
            break;
        } else {
            const startCallback = Date.now();

            await new Promise((resolve, reject) => {
                fs.readFile('result.txt', (err, data) => {
                    console.info(`nested file read took: ${Date.now() - startCallback}ms`);
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
        i++;
    }
    console.info('non-blocking callback done');
    return 'all reads done';
});

// fast, no delay for timeout

/**
 file read took: 2ms
 ...
 ...
 nested file read took: 0ms
 nested file read took: 3ms
 nested file read took: 1ms
 nested file read took: 0ms
 nested file read took: 0ms
 non-blocking callback done
 all reads done
 102ms have passed since I was scheduled
*/

/*
interesting detail:
the time for reading the nested file does not cummulate
*/
