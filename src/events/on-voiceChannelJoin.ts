import KetClient from "../KetClient";

module.exports = class voiceChannelJoinEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start(member) {
        await global.session.db.find(member.user.id, true);
        this.ket.callTime.set(member.user.id, Date.now());
    }
}