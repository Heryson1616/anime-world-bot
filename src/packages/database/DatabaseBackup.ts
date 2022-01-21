import KetClient from "../../KetClient";

module.exports = (ket: KetClient) => {
    let db = global.session.db;
    if (!db) return setTimeout(() => module.exports(ket), 5_000)

    async function Backup() {
        //  Backup da database
        Object.entries(db).forEach(async ([key, value]) => typeof value === 'object'
            ? ket.createMessage(ket.config.channels.database, `Backup da table \`${key}\``, { name: `${key}.json`, file: JSON.stringify((await db[key].getAll())) })
            : null);
    }

    Backup();
    setInterval(() => Backup(), 60_000 * 30);
}