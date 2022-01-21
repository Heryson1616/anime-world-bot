import c from "chalk";
import { Client } from "pg";
import table from "./_DatabaseTables";

let
    PgConfig = {
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        user: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        ssl: process.env.SSL_MODE == 'false' ? false : { rejectUnauthorized: false }
    },
    postgres = global.session.postgres = new Client(PgConfig);

global.session.db = {
    ready: false,
    disconnect: () => {
        postgres.end()
        global.session.db.ready = false;
    }
}

module.exports = async (ket) => {

    if (global.session.db.ready) return;
    global.session.log('shard', 'DATABASE', 'Conectando ao banco de dados...');

    await postgres.connect()
        .then(() => {
            global.session.db = {
                ready: true,
                disconnect: () => {
                    postgres.end()
                    global.session.db.ready = false;
                },
                users: new table('users', 'id', postgres),
                servers: new table('servers', 'id', postgres),
                globalchat: new table('globalchat', 'id', postgres),
                commands: new table('commands', 'name', postgres),
                blacklist: new table('blacklist', 'id', postgres)
            };
            global.session.log('log', 'DATABASE', '√ Banco de dados operante');
        })
        .catch((error) => global.session.log('error', 'DATABASE', `x Não foi possível realizar conexão ao banco de dados`, error))

    /* DATABASE TESTS */
    await postgres.query(`SELECT * FROM users`)
        .catch(async () => {
            global.session.log('log', 'DATABASE', c.yellow(`Criando tabela users`));
            await postgres.query(`CREATE TABLE public.users (
            id VARCHAR(20) NOT NULL PRIMARY KEY,
            prefix VARCHAR(3) NOT NULL DEFAULT '${ket.config.DEFAULT_PREFIX}',
            registros NUMERIC CHECK(commands > -1) DEFAULT 1));`)
        })
}