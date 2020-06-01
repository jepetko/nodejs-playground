const fs = require('fs');

function someAsyncOperation(callback) {
    const now = Date.now();
    fs.readFile('result.txt', () => {
        console.info(`file read took: ${Date.now() - now}ms`);
        callback();
    });
}

const timeoutScheduled = Date.now();

setTimeout(() => {
    const delay = Date.now() - timeoutScheduled;

    console.log(`${delay}ms have passed since I was scheduled`);
}, 100);

// do someAsyncOperation which takes 95 ms to complete
someAsyncOperation(() => {
    const startCallback = Date.now();

    // do something that will take 1000ms...
    partition(startCallback, 1000);
});

function partition(time, max) {
    if (Date.now() - time >= max) {
        console.info('non-blocking callback done');
        return;
    }
    setImmediate(() => partition(time, max));
}

// what is bad on this:
// * blocking the queue with the callback delayed the timeout!
/*
file read took: 3ms
140ms have passed since I was scheduled
blocking callback done
*/
