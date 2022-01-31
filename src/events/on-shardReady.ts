import KetClient from "../KetClient";

module.exports = class ShardReadyEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start(shardID: number) {
        console.log(`SHARD ${shardID}`, 'Conectada ao Discord', 34);
        this.ket.guilds.get(this.ket.config.server)?.voiceStates.forEach((vc) => this.ket.users.get(vc.id).bot ? null : this.ket.callTime.set(vc.id, Date.now()))
        return this.ket.shardUptime.set(shardID, Date.now());
    }
}