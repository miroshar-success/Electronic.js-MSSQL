const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'asdfASDF!@#$1234',
    server: '138.201.139.211', // or 'localhost\\SQLEXPRESS' if using a named instance
    database: 'Richmond',
    port: 1433,
    options: {
        encrypt: false, // Set to true if using Azure
        trustServerCertificate: true, // Change to false if you have a valid certificate
        connectionTimeout: 30000, // 30 seconds
    }
};

async function connectToDatabase() {
    try {
        await sql.connect(config);
        console.log('Connected to SQL Server');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

async function queryDatabase(query) {
    try {
        const result = await sql.query(query);
        console.log('Query result:', result.recordset);
        return result.recordset;
    } catch (err) {
        console.error('Query execution failed:', err);
    }
}

module.exports = { connectToDatabase, queryDatabase };