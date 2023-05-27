const mysql = require('mysql2');

const db = mysql.createConnection(
    { 
        host: 'localhost',
        user: 'root',
        password: 'Harun1999',
        database: 'employee_management_db'
    },
    console.log(`Connected to the employee management database.`)
);

module.exports = db;

