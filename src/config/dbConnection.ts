import mysql from 'mysql2'


/**
 * Creates a connection pool to the MySQL database using environment variables.
 * 
 * - `host`: The hostname of the database server (e.g., 'localhost' or a cloud DB endpoint)
 * - `user`: The MySQL user to authenticate with
 * - `password`: The password for the MySQL user
 * - `database`: The name of the specific database to connect to
 * 
 * `.promise()` is called to enable using async/await syntax with MySQL queries.
 */

export const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
}).promise();
