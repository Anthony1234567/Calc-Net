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
        this.busy = false;
    }

    async sendMessage(target, message, callback) {
        return sendMessage(target, message, callback);
    }
}

/**
 * Input machine: 
 * This machine has the next 5 input statements to be computed. It sends each statement 
 * in a message to the A machine. It puts the result value next to the current statement 
 * and then makes the next statement current.
 */
class MachineI extends Machine {
    constructor(statements) {
        super('I');

        this.statements;
    }

    async calculate() {
        console.log('Calculating...');

        this.busy = true;
        this.statements = [
            { value: document.getElementById('1').value, result: undefined },
            { value: document.getElementById('2').value, result: undefined },
            { value: document.getElementById('3').value, result: undefined },
            { value: document.getElementById('4').value, result: undefined },
            { value: document.getElementById('5').value, result: undefined }
        ];

        console.log('Statements: ' + this.statements);
        
        this.statements.forEach(statement => {
            if (statement.value) {
                this.sendMessage('A', document.getElementById('1').value, function(result) { 
                    console.log(result); 
                });
            }
        });
    }
}

/**
 * Assignment machine:
 * It can take an assignment statement (as above), split off the RHS and send it to an E machine, 
 * get the E result value, and send a Store message to a D machine. On getting the Stored result message, 
 * the A machine returns the value to the I machine and becomes ready for another statement.
 */
class MachineA extends Machine {
    constructor() {
        super('A');
    }

    split(statement, callback) {
        if (this.busy) {
            return 'NAK';
        } else {
            
            return 'ACK'
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

    split(statement, callback) {
        if (this.busy) {
            return 'NAK'
        } else {
            return 'ACK'
        }
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

    async split(statement) {

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

    async split(statement) {

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
        super('P');
    }

    async split(statement) {

    }
}

const machineI = new MachineI();
const machineA = new MachineA();
const machineE = new MachineE();
const machineT1 = new MachineT();
const machineT2 = new MachineT();
const machineP = new MachineP();
const machineD = new MachineD();

function calculate() {
    machineI.calculate();
}

function sendMessage(target, message, callback) {
    var result;

    switch (target) {
        case 'I':
            break;
        case 'A':
            result = machineA.split(message, callback);

            break;
        case 'E':
            break;
        case 'T':
            break;
        case 'P':
            break;
        case 'D':
            break;
    }

    callback('Result of message: ' + message + ' is ' + result);
}