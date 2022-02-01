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
        return new Promise((res, rej) => onValue(this.getRef(index), snapshot => {
            if (snapshot.val()) return snapshot.val();
            if (createIfNull) return res(this.set(index, this.template, true));
            else return res(this.template);
        }, rej));
    }

    set(index: string, data: { prefix?: string, registros?: string | number, callTime?: string | number }, returnValue: boolean = false) {
        index = String(index).slice(0, 20)
        return new Promise(async (res, rej) => {
            let oldData = await this.get(index);

            if (data) Object.entries(data).forEach(([key, value]) => {
                let s = String(this.schema[key]).split('limit ')
                if (typeof value === 'string' && value.includes('sql ')) eval(`data.${key} = ${value.replace('sql ', '')}`);

                if (s) data[key] = eval(`${s[0]}(value)${s[1] !== '-1' ? `.slice(0, ${s[1]})` : ''}`);
            })

            if (oldData) data = Object.assign(oldData, data);
            await set(this.getRef(index), data);
            if (returnValue) return res(this.get(index));
            return true;
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
    //@ts-ignore
    (db = new Database(process.env)).connect()
        .then(() => {
            global.db = db;
            console.log('DATABASE', '√ Banco de dados operante', 32);

            function Backup() {
                ket.createMessage(ket.config.channels.database, `Backup do banco de dados`, { name: `database.json`, file: JSON.stringify(db.get(`/`)) })
            }
            Backup();
            setInterval(() => Backup(), 60_000 * 30);
        })
        .catch((error) => console.log('DATABASE', `x Não foi possível realizar conexão ao banco de dados: ${error}`, 41));
}