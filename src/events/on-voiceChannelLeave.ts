import KetClient from "../KetClient";

module.exports = class voiceChannelLeaveEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start(member, oldChannel) {
        if (!this.ket.callTime.get(member.user.id) || oldChannel?.parentID !== "930831522108411915") return;

        const db = global.session.db,
            initialTimestamp = this.ket.callTime.get(member.user.id),
            user = await db.users.find(member.user.id, true),
            callDuration = Date.now() - initialTimestamp;

        if (isNaN(callDuration)) return;
        await db.users.find(member.user.id, true);
        await db.users.update(user.id, { callTime: `sql callTime + ${callDuration}` });
        this.ket.callTime.delete(member.user.id);
    }
}