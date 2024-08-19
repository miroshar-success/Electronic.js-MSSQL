const { connectToDatabase, queryDatabase } = require('./db');

console.log('Connecting to database...');
connectToDatabase();
console.log('Connected successfully.');