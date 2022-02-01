import KetClient from "../KetClient";

module.exports = class voiceChannelJoinEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start(member, channel) {
        if (channel.parentID !== '930831522108411915' || member.user?.bot) return;
        await global.db.get(`/users/${member.id}`, true);
        this.ket.callTime.set(member.user.id, Date.now());
    }
}