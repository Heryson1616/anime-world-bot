import app, { FirebaseOptions } from "firebase/app";
import firebase from "firebase/database";
let db: any;

class Database {
    firebase: typeof firebase;
    firebaseConfig: FirebaseOptions;
    app: typeof app;
    database: any;
    ready: boolean;
    schema: object
    template: object;
    constructor(firebaseConfig) {
        this.firebase = firebase;
        this.app = app;
        this.firebaseConfig = firebaseConfig;
        this.database = null;
        this.ready = false;
        this.schema = {
            id: 'String limit 20',
            prefix: 'String limit 3',
            registros: 'Number limit -1',
            callTime: 'Number limit -1'
        }
        this.template = {
            prefix: 'al!',
            registros: 0,
            callTime: 0
        }
    }

    public connect() {
        const fbApp = app.initializeApp(this.firebaseConfig);
        this.database = firebase.getDatabase(fbApp);
        return this;
    }

    public getRef(ref: string) {
        return firebase.ref(this.database, ref);
    }

    public get(ref: string) {
        return new Promise((res, rej) => firebase.onValue(this.getRef(ref), snapshot => snapshot.val() ? snapshot.val() : this.template, rej));
    }

    public set(index: string, data: { prefix?: string, registros?: string | number, callTime?: string | number }, returnValue: boolean = false) {
        index = String(index).slice(0, 20)
        return new Promise(async (res, rej) => {
            let oldData = await this.get(index);

            if (data) Object.entries(data).forEach(([key, value]) => {
                let s = String(this.schema[key]).split('limit ')
                if (typeof value === 'string' && value.includes('sql ')) eval(`data.${key} = ${value.replace('sql ', '')}`);

                if (s) data[key] = eval(`${s[0]}(value)${s[1] !== '-1' ? `.slice(0, ${s[1]})` : ''}`);
            })

            if (oldData) data = Object.assign(oldData, data);
            await firebase.set(this.getRef(index), data);
            if (returnValue) return res(this.get(index));
            return true;
        });
    }

    public delete(index) {
        return firebase.remove(this.getRef(index)) ? true : false;
    }

    public exists(index) {
        return new Promise((res, rej) => firebase.onValue(this.getRef(index), snapshot => res(snapshot.exists()), rej));
    }
};

export default async (ket) => {

    if (db.ready) return;
    (db = new Database(process.env.DATABASE_CRED)).ready = false

    db.connect()
        .then(() => {
            (global.db = db).ready = true;
            console.log('DATABASE', '√ Banco de dados operante', 32);

            function Backup() {
                ket.createMessage(ket.config.channels.database, `Backup do banco de dados`, { name: `database.json`, file: JSON.stringify(db.get`/`) })
            }
            Backup();
            setInterval(() => Backup(), 60_000 * 30);
        })
        .catch((error) => console.log('DATABASE', `x Não foi possível realizar conexão ao banco de dados: ${error}`, 41));
}