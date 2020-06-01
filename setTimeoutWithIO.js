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

    let i = 0;
    for(;;) {
        if (i === 1000) {
            break;
        } else {
            const startCallback = Date.now();

            fs.readFile('result.txt', (err, data) => {
                process.stdout.write(`${Date.now() - startCallback}ms`);
                // console.info(`nested file read took: ${Date.now() - startCallback}ms`);
            });
        }
        i++;
    }
    console.info('non-blocking callback done');
});


// what is bad on this:
// * blocking the queue with the callback delayed the timeout!
/*
file read took: 3ms
non-blocking callback done
133ms have passed since I was scheduled
file read took: 129ms
file read took: 129ms
...

===> subsequent file reads come after setTimeout callback

why is the duration increasing?
* callback itself is called after 1st file has been read but not for the subsequent reads.
* I/O work is scheduled but callbacks don't fit into the poll phase


if 1000 iterations is changed to 10:

file read took: 3ms
non-blocking callback done
file read took: 2ms
file read took: 3ms
file read took: 3ms
file read took: 3ms
file read took: 2ms
file read took: 2ms
file read took: 2ms
file read took: 2ms
file read took: 2ms
file read took: 2ms
101ms have passed since I was scheduled

===> subsequent file reads fit into the poll phase

 */
