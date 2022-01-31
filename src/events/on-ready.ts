import KetClient from "../KetClient";
import TerminalClient from "../components/CLI/TerminalClient";
import gradient from "gradient-string";

module.exports = class ReadyEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start() {
        let status: object[] = [
            { name: 'no vasco', type: 0 },
            { name: 'sua mãe da janela', type: 0 },
            { name: 'sua mãe na panela', type: 0 },
            { name: "mais um gol do vasco", type: 3 },
            { name: "sua mãe gemendo", type: 2 },
            { name: 'Vasco x Flamengo', type: 5 }
        ],
            db = global.session.db;
        //@ts-ignore
        setInterval(async () => this.ket.editStatus("dnd", status[Math.floor(Math.random() * status.length)]), 20_000)
        console.log('READY', `Sessão iniciada como ${this.ket.user.tag}`, 33);
        console.info(gradient('red', 'yellow')("◆ ▬▬▬▬▬▬▬▬▬▬▬ ❴ ✪ ❵ ▬▬▬▬▬▬▬▬▬▬▬ ◆"));
        console.log(`Operante em ${this.ket.guilds.size} templos com ${this.ket.guilds.map(g => g.memberCount).reduce((acc, crt) => acc + crt) - this.ket.guilds.size} subordinados`);
        return TerminalClient(this.ket);
    }
}