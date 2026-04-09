// Import events module
const EventEmitter = require('events');

// Create event emitter object
const eventEmitter = new EventEmitter();

// 1. Register first listener
eventEmitter.on('greet', (name) => {
    console.log(`Hello ${name}! Welcome.`);
});

// 2. Register second listener (multiple listeners)
eventEmitter.on('greet', (name) => {
    console.log(`How are you, ${name}?`);
});

// 3. Register another event
eventEmitter.on('bye', () => {
    console.log('Goodbye! Have a nice day.');
});

// 4. Trigger events using emit()
console.log('Event execution started...');

eventEmitter.emit('greet', 'Ravi'); // passing data
eventEmitter.emit('bye');

console.log('Event execution completed.');