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

    // do something that will take 10ms...
    while (Date.now() - startCallback < 1000) {
        // do nothing
    }
    console.info('blocking callback done');
});


// what is bad on this:
// * blocking the queue with the callback delayed the timeout!
/*
file read took: 3ms
done
1015ms have passed since I was scheduled
 */
