const { Client } = require('pg');
require('dotenv').config()
async function main() {

    const postgres = new Client({
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        user: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT)
    });

    postgres.connect();

    let data = await postgres.query('SELECT * FROM users;');
    console.log(data.rows)
}
main()