async function fun(idx) {
    // throw new Error('have fun');
    // return Promise.reject('have fun');
    return `have more fun: ${idx}`;
}

async function use() {
    let i = 0;
    while(i < 1000) {
        try {
            const result = await fun(i++);
            console.info('result', result);
        } catch (e) {
            console.info('..catch');
            console.error(e);
        }
    }
}

let i = 0;
while (i++ < 10) {
    setTimeout(use);
}

// 1. throw new Error/await fun() -> implicitly wrapped in Promise -> caught in .catch or catch(e)
// 2. return Promise.reject(...)/await fun -> explicitly returned rejected Promise -> caught in .catch or catch(e)
// 3. throw new Error/fun() -> error not propagated to the .catch/catch block (UnhandledPromiseRejectionWarning: issued by node.js)
// 4. return Promise.reject(...)/fun() -> error not propagated to the .catch/catch block (UnhandledPromiseRejectionWarning: issued by node.js)

// --> the only diff between throw/reject is that in throw the Error is wrapped automatically into rejected promise

// 5. return Promise.reject(...)/fun().catch(e ...) -> correct
// 6. return Promise.reject(...)/catch (e) -> correct

