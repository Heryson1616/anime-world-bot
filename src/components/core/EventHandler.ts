import KetClient from "../../KetClient";
export default class EventHandler {
    ket: KetClient;
    events: { name: string, run: any }[];

    constructor(ket: KetClient) {
        this.ket = ket;
        this.events = [];
    }
    add(name: string, dir: string) {
        this.events.push({ name: name, run: require(dir) })
        return name === 'ready'
            ? this.ket.once(name, (...args) => this.execute(name, args))
            : this.ket.on(name, (...args) => this.execute(name, args));
    }
    execute(name: string, args: any[]) {
        return this.events.filter(e => e.name === name).forEach((e) => {
            return new (e.run)(this.ket).start(...args);
            // delete require.cache[require.resolve(event.dir)];
            // try {
                // return new (require(event.dir))(this.ket).start(...args);
            // } catch (e) {
                // return this.ket.emit('error', e);
            // }
        })
    }
    remove(name: string) {
        if (!this.events.filter(event => event.name === name)[0]) return false;
        delete this.events[this.events.findIndex(event => event.name === name)];
        return true;
    }
}