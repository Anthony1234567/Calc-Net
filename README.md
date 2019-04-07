# Calc-Net
CECS 545: Software Architecture - Calc Net

## Usage Requirements
* Supports systems of equations with at most 5 unique variables
* Supported Operators: `+`, `*`, `^`
* At least 1 equation per unique variable
* At least `n-1` variables explicitly set 
* Only same case variables across input(s)

## Running
To start calculating load factory.html into a web browser and input the statements that need to be calculated. Ensure that all setup statements are processed first by placing them before the more complex inputs. Inputs are processed one at a time and their results can be seen in the table on Machine D. Once all inputs are processed the user will be prompted to refresh the page before processing more inputs.

## Third Party Referrences
* Bootstrap for styling HTML

## Sample equation system
```
1. X=4
2. Y=5
3. Z=X^2+4*Y
```

## Message Direction
<img width="715" alt="Screen Shot 2019-04-07 at 3 04 48 PM" src="https://user-images.githubusercontent.com/6342285/55690457-de14d200-5946-11e9-8a3d-1dc5ab7f7f2d.png">

## Sample Messsage Passing Between Machines (Can be executed from browser console)
```
/**
 * Machine I - Input Message
 */
sendMessage('I', new Message('INPUT', { value: [
    'x=2',
    'y=x^2+2*x+1'
  ] }), result => {
    console.log(result);
});

/**
 * Machine A - Assignment Message
 */
sendMessage('A', new Message('ASSIGNMENT', { value: 'y=2*x^2+2' }), result => {
    console.log(result);
});

/**
 * Machine E - Expression Message
 */
sendMessage('E', new Message('EXPRESSION', { value: '2*x^2+2' }), result => {
    console.log(result);
});

/**
 * Machine T - Term Message
 */
sendMessage('T', new Message('TERM', { value: '2*x^2' }), result => {
    console.log(result);
});

/**
 * Machine P - Power Message
 */
sendMessage('P', new Message('POWER', { value: 'x^2'}), result => {
    console.log(result);
});

/**
 * Machine D - Store Message
 */
sendMessage('D', new Message('STORE', { key: 'x', value: 2 }), result => {
    console.log(result);
});

/**
 * Machine D - Load Message
 */
sendMessage('D', new Message('LOAD', { key: 'x' }), result => {
    console.log(result);
});
```

## Sample Run
<img width="1440" alt="Screen Shot 2019-04-07 at 3 09 43 PM" src="https://user-images.githubusercontent.com/6342285/55690482-4499f000-5947-11e9-9596-b9b5cd32cb6a.png">

## Known Issues
Please submit issue reports under [Issues](https://github.com/Anthony1234567/Calc-Net/issues)

* Lines between machines not implemented.
* Data displayed in P Machine sometimes shows NAN
