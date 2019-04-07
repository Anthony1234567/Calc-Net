/** 
 * The machines are of 6 kinds: I, A, E, T, P, and D. They can send blocking messages to each other. 
 * When a machine is working on a message, it is not available for other work and replies with a NAK: not acknowledged. 
 * A machine accepting a work message first acknowledges the message with an ACK reply, 
 * then works to produce the result, then sends a result message to the original sender. 
 * A machine is busy until it either receives a NAK or it receives the result message. 
 * While it is busy, it returns other request messages with a NAK.
 */
class Machine {
    constructor(type) {
        this.type = type
        this.isBusy = false;
        this.data = [];
    }

    sendMessage(target, message, callback) {
        return sendMessage(target, message, callback);
    }

    set(key, value) {
        const existingElement = this.get(key);

        if (existingElement) {
            existingElement.value = value;
        } else {
            this.data.push({
                key: key,
                value: value
            });
        }
    }

    get(key) {
        return this.data.find(element => element.key === key);
    }
}

/**
 * Input machine: 
 * This machine has the next 5 input statements to be computed. It sends each statement 
 * in a message to the A machine. It puts the result value next to the current statement 
 * and then makes the next statement current.
 */
class MachineI extends Machine {
    constructor() {
        super('I');

        this.currentAssignment = 0;
    }

    acknowledge(message, callback) {
        console.log('MachineI');
        console.log('message: ' + JSON.stringify(message));
        console.log('isBusy: ' + this.isBusy);

        if (this.isBusy) {
            return 'NAK';
        } else {
            this.isBusy = true;
            this.data = [];
            this.currentAssignment = 0;

            message.data.value.forEach(input => {
                if (input) {
                    this.set(input, undefined);
                }
            });

            this.calculateStatement(this.data[this.currentAssignment].key, callback);

            return 'ACK';
        }
    }

    async calculateStatement(assignment, callback) {
        if (this.sendMessage('A', new Message('ASSIGNMENT', { value: assignment }), result => { 
                console.warn('Callback for message to A');
                console.log('MachineI assignment message to MachineA: ' + JSON.stringify({ value: assignment }));
                console.log('result: ' + result);

                this.set(assignment, result);   
                this.currentAssignment++;

                if (this.data[this.currentAssignment]) {
                    setTimeout(() => {
                        this.calculateStatement(this.data[this.currentAssignment].key, callback);
                    }, 1000);
                } else {
                    callback();
                    this.isBusy = false;
                }
            }) === 'NAK') {
            this.isBusy = false;
        }
    }
}

/**
 * Assignment machine:
 * It can take an assignment statement, split off the RHS and send it to an E machine, 
 * get the E result value, and send a Store message to a D machine. On getting the Stored result message, 
 * the A machine returns the value to the I machine and becomes ready for another statement.
 */
class MachineA extends Machine {
    constructor() {
        super('A');
    }

    acknowledge(message, callback) {
        console.log('MachineA');
        console.log('message: ' + JSON.stringify(message));
        console.log('isBusy: ' + this.isBusy);

        if (this.isBusy) {
            return 'NAK';
        } else {
            this.isBusy = true;
            this.data = [];

            setTimeout(() => { 
                this.split(message.data.value, callback);
            }, 1000);

            return 'ACK';
        }
    }

    async split(statement, callback) {
        const sides = statement.split('=');

        if (this.sendMessage('E', new Message('EXPRESSION', { value: sides[1] }), result => { 
                console.warn('Callback for message to D');
                console.log('MachineA expression message to MachineE: ' + JSON.stringify({ value: sides[1] }));
                console.log('result: ' + result);

                let dInterval = setInterval(() => {
                    if (dInterval) {
                        console.log('In dInterval: ' + dInterval);

                        sendMessage('D', new Message('STORE', { key: sides[0], value: result }), storedValue => {
                            if (dInterval) {
                                console.warn('Callback for message to D');
                                console.log('MachineA store message to MachineD: ' + JSON.stringify({ key: sides[0], value: result }));
                                console.log('storedValue: ' + storedValue);

                                clearInterval(dInterval);
                                callback(Number(result));

                                this.isBusy = false;
                            }
                        });
                    }
                }, 500);


            }) === 'NAK') {
            this.isBusy = false;
        }
    }
}

/**
 * Expression machine: 
 * It can take an arithmetic expression (a polynomial as above) and split off each term and send each term 
 * to a T machine and get the result integer back and sum all the results from all the terms and return that 
 * sum to its sender. It has an array large enough to store the value of each term in the polynomial 
 * it gets (to simplify its life, and help make visible what is going on).
 */
class MachineE extends Machine {
    constructor() {
        super('E');
    }

    acknowledge(message, callback) {
        console.log('MachineE');
        console.log('message: ' + JSON.stringify(message));
        console.log('isBusy: ' + this.isBusy);

        if (this.isBusy) {
            return 'NAK';
        } else {
            this.isBusy = true;
            this.data = [];

            setTimeout(() => { 
                this.split(message.data.value, callback);
            }, 1000);

            return 'ACK';
        }
    }

    async split(expression, callback) {
        expression.split('+').forEach(term => {
            this.set(term, undefined);

            if (isNumeric(term)) {
                setTimeout(() => { 
                    this.set(term, Number(term));
                }, 500);
            } else {
                // Split off each term and send each term to a T machine 
                let tInterval = setInterval(() => {
                    if (tInterval) {
                        console.log('In tInterval: ' + tInterval);

                        sendMessage('T', new Message('TERM', { value: term }), result => {
                            if (tInterval) {
                                console.warn('Callback for message to T');
                                console.log('MachineE term message to MachineT: ' + JSON.stringify({ value: term }));
                                console.log('result: ' + result);

                                clearInterval(tInterval);
                                this.set(term, Number(result));
                            }                    
                        });
                    }
                }, 500);
            }
        });

        let termInterval = setInterval(() => { 
            if (termInterval) {
                console.log('In termInterval');
                console.log(this.data);

                if (!this.data.find(element => !element.value)) {
                    clearInterval(termInterval);

                    if (this.data.length === 1) {
                        if (expression.includes('+')) {
                            callback(Number(this.data[0].value) + Number(this.data[0].value));
                        } else {
                            callback(Number(this.data[0].value));
                        }
                    } else {
                        callback(this.data.reduce((termA, termB) =>  Number(termA.value) + Number(termB.value)));
                    }

                    this.isBusy = false;
                }
            }
        }, 500);
    }
}

/**
 * Term machine: 
 * It can take a term (of multiplied factors) and split off each factor. If the factor is a constant, 
 * it can be used directly. If the factor is a variable, it can send it to a D machine and get the result 
 * integer value back. If the factor is an exponentiation, it can send this to a P machine and get the result integer 
 * value back. It can then compute the product of all these values and return the result to its sender. 
 * It also has an array for temporary storage of the various factors it splits off. 
 */
class MachineT extends Machine {
    constructor() {
        super('T');
    }

    acknowledge(message, callback) {
        console.log('MachineT');
        console.log('message: ' + JSON.stringify(message));
        console.log('isBusy: ' + this.isBusy);

        if (this.isBusy) {
            return 'NAK';
        } else {
            this.isBusy = true;
            this.data = [];

            setTimeout(() => { 
                this.split(message.data.value, callback);
            }, 1000);

            return 'ACK'
        }
    }

    async split(term, callback) {
        term.split('*').forEach(factor => {
            this.set(factor, undefined);

            if (isNumeric(factor)) { // If the factor is a constant, it can be used directly
                setTimeout(() => { 
                    this.set(factor, Number(factor));
                }, 1000);
            } else if (factor.includes('^')) { // If the factor is an exponentiation, it can send this to a P machine and get the result integer value back
                let pInterval = setInterval(() => { 
                    if (pInterval) {
                        console.log('In pInterval: ' + pInterval);

                        sendMessage('P', new Message('POWER', { value: factor}), result => {
                            if (pInterval) {
                                console.warn('Callback for message to P');
                                console.log('MachineT power message to MachineP: ' + JSON.stringify({ value: factor }));
                                console.log('result: ' + result);

                                this.set(factor, Number(result));
                                clearInterval(pInterval);
                            }
                        });
                    }
                }, 500);
            } else { // If the factor is a variable, it can send it to a D machine and get the result integer value back
                let dInterval = setInterval(() => { 
                    if (dInterval) {
                        console.log('In dInterval: ' + dInterval);

                        sendMessage('D', new Message('LOAD', { key: factor }), result => {
                            if (dInterval) {
                                console.warn('Callback for message to D');
                                console.log('MachineT load message to MachineD: ' + JSON.stringify({ key: factor }));
                                console.log('result: ' + result);

                                this.set(factor, Number(result));
                                clearInterval(dInterval);
                            }
                        });
                    }
                }, 500);
            }
        });

        let factorInterval = setInterval(() => { 
            if (factorInterval) {
                console.log('In factorInterval: ' + factorInterval);
                console.log(this.data);

                if (!this.data.find(element => !element.value)) {
                    clearInterval(factorInterval);
                    
                    if (this.data.length === 1) {
                        if (term.includes('*')) {
                            callback(Number(this.data[0].value) * Number(this.data[0].value));
                        } else {
                            callback(Number(this.data[0].value));
                        }
                    } else {
                        callback(this.data.reduce((factorA, factorB) => Number(factorA.value) * Number(factorB.value)));
                    }

                    this.isBusy = false;
                }
            }
        }, 500);
    }
}

/**
 * Power machine: 
 * It can take a power expression consisting of a variable and a constant integer exponent. It returns the result to its sender. 
 * It sends a Load message with the variable to a D machine, then uses the result value to compute the exponential value and 
 * return it to the sender. It has a 2-element temporary array.
 */
class MachineP extends Machine {
    constructor() {
        super('P');
    }

    acknowledge(message, callback) {
        console.log('MachineP');
        console.log('message: ' + JSON.stringify(message));
        console.log('isBusy: ' + this.isBusy);

        if (this.isBusy) {
            return 'NAK';
        } else {
            this.isBusy = true;
            this.data = [];

            setTimeout(() => { 
                this.evaluate(message.data.value, callback);
            }, 1000);

            return 'ACK'
        }
    }

    async evaluate(powerExpression, callback) {
        const base = powerExpression.split('^')[0];
        const exponent = powerExpression.split('^')[1];

        if (isNumeric(base)) {
            setTimeout(() => { 
                callback(Math.pow(Number(base), Number(exponent)));

                this.isBusy = false;
            }, 500);
        } else {
            let dInterval = setInterval(() => { 
                if (dInterval) {
                    console.log('In dInterval: ' + dInterval);

                    sendMessage('D', new Message('LOAD', { key: base }), result => {
                        if (dInterval) {
                            console.warn('Callback for message to D');
                            console.log('MachineP load message to MachineD: ' + JSON.stringify({ key: base }));
                            console.log('result: ' + result);

                            clearInterval(dInterval);
                            callback(Math.pow(Number(result), Number(exponent)));

                            this.isBusy = false;
                        }
                    });
                }
            }, 500);
        }
    }
}

/**
 * Data machine: 
 * It can take two messages. The first is a Load message with the name (a letter) of a variable. It returns the variable's current 
 * value to the sender. The second is a Store message with both the name of variable and a constant value. It stores the value in the 
 * variable's box (a slot in an internal array), and returns a STORED message. It has an internal array for 26 variables.
 */
class MachineD extends Machine {
    constructor() {
        super('D');

        // Never reset
        this.data = new Map(); 
    }

    acknowledge(message, callback) {
        console.log('MachineD');
        console.log('message: ' + JSON.stringify(message));
        console.log('isBusy: ' + this.isBusy);

        if (this.isBusy) {
            return 'NAK';
        } else {
            this.isBusy = true;

            setTimeout(() => { 
                switch (message.type) {
                    case 'LOAD':
                        this.load(message.data.key, callback);

                        break;
                    case 'STORE':
                        this.store(message.data.key, message.data.value, callback);

                        break;
                    default:
                        console.warn('Unexpected message type: ' + message.type);
                }
            }, 1000);
            
            return 'ACK';
        }
    }

    async load(key, callback) {
        callback(Number(this.data.get(key)));

        this.isBusy = false;
    }

    async store(key, value, callback) {
        this.data.set(key, Number(value));

        this.updatePage(key, value);
        callback('STORED');

        this.isBusy = false;
    }

    updatePage(key, value) {
        if (document.getElementById('emptyTableMessage')) {
            // Clear empty map message
            document.getElementById('emptyTableMessage').remove();
        }

        const tableBody = document.getElementById('variableTable').querySelector('tbody');
        const row = Array.from(tableBody.querySelectorAll('tr')).find(row => row.id === key);

        // Row for variable already exists
        if (row) {
            row.querySelectorAll('td')[1].innerText = value;
        } else {
            let rowElement = document.createElement('tr');
            rowElement.id = key;
            rowElement.innerHTML = '<td>' + key + '</td>' + '<td>' + value + '</td>';

            tableBody.appendChild(rowElement);
        }
    }
}

/**
 * Contains message type and date to pass between machines
 */
class Message {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
}