import { initializeApp, FirebaseOptions } from "firebase/app";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import KetClient from "../../KetClient";
let db: any;
class Database {
    firebaseConfig: FirebaseOptions;
    database: any;
    schema: object
    template: object;
    constructor(firebaseConfig: FirebaseOptions) {
        this.firebaseConfig = firebaseConfig;
        this.database = null;
        this.schema = {
            id: 'String limit 20',
            prefix: 'String limit 3',
            registros: 'Number limit -1',
            callTime: 'Number limit -1',
            banned: 'Boolean limit -1'
        }
        this.template = {
            prefix: 'al!',
            registros: 0,
            callTime: 0,
            banned: false
        }
    }

    public async connect() {
        const fbApp = initializeApp(this.firebaseConfig);
        this.database = getDatabase(fbApp);
        return this;
    }

    getRef(index: string) {
        return ref(this.database, index);
    }

    get(index: string, createIfNull: boolean = false) {
        return new Promise((res, rej) => onValue(this.getRef(index), async (snapshot) => snapshot.val() ? res(snapshot.val()) : (createIfNull ? res(this.set(index, this.template, true)) : res(this.template)), rej));
    }

    set(index: string, data: { prefix?: string, registros?: string | number, callTime?: string | number }, returnValue: boolean = false) {
        return new Promise(async (res, rej) => {
            let oldData = await this.get(index);
            if (data) Object.entries(data).forEach(([key, value]) => {
                let s = String(this.schema[key]).split(' limit ')
                if (typeof value === 'string' && value.includes('sql '))
                    eval(`data.${key} = ${s[0]}(${value.replace('sql ', '')})${s[1] !== '-1' ? `.slice(0, ${s[1]})` : ''}`);
            })

            if (oldData) data = Object.assign(oldData, data);
            set(this.getRef(index), data);
            if (returnValue) return res(this.get(index));
            return res(true);
        });
    }

    delete(index: string) {
        return remove(this.getRef(index)) ? true : false;
    }

    public exists(index: string) {
        return new Promise((res, rej) => onValue(this.getRef(index), snapshot => res(snapshot.exists()), rej));
    }
};

export default async (ket: KetClient) => {
    return (db = new Database(ket.config.DATABASE_CREDENTIALS)).connect()
        .then(() => {
            global.db = db;
            console.log('DATABASE', '√ Banco de dados operante', 32);

            async function Backup() {
                ket.createMessage(ket.config.channels.database, `Backup do banco de dados`, { name: `database.json`, file: JSON.stringify(await db.get(`/`)) })
            }
            Backup();
            setInterval(() => Backup(), 60_000 * 30);
        })
        .catch((error) => console.log('DATABASE', `x Não foi possível realizar conexão ao banco de dados: ${error}`, 41));
}