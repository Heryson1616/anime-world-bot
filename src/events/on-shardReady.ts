import KetClient from "../KetClient";

module.exports = class ShardReadyEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start(shardID: number) {
        global.session.log('shard', "SHARDING MANAGER", `Shard ${shardID} acordou`);
        this.ket.guilds.get('915935321332547634').voiceStates.forEach((vc) => this.ket.callTime.set(vc.id, Date.now()))
        return this.ket.shardUptime.set(shardID, Date.now());
    }
}