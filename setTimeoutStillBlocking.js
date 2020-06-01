const fs = require('fs');

function someAsyncOperation(callback) {
    const now = Date.now();
    fs.readFile('result.txt', async () => {
        console.info(`file read took: ${Date.now() - now}ms`);
        await callback();
    });
}

const timeoutScheduled = Date.now();

setTimeout(() => {
    const delay = Date.now() - timeoutScheduled;

    console.log(`setTimeout: ${delay}ms have passed since I was scheduled`);
}, 100);

// do someAsyncOperation which takes 95 ms to complete
someAsyncOperation(() => {
    const startCallback = Date.now();

    return new Promise((resolve) => {
        while (Date.now() - startCallback < 1000) {
            // do nothing
        }
        console.info('blocking callback done');
        resolve();
    });

});

// what is bad on this:
// * blocking the queue with the callback delayed the timeout!
/*
file read took: 13ms
blocking callback done
setTimeout: 1014ms have passed since I was scheduled
 */
