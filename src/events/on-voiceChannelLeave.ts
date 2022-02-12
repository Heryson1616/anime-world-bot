import { GuildChannel, Member } from "eris";
import KetClient from "../KetClient";

module.exports = class voiceChannelLeaveEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start(member: Member, oldChannel: GuildChannel) {
        if (!this.ket.callTime.get(member.user.id) || oldChannel?.parentID !== "930831522108411915") return;

        const db = global.db,
            initialTimestamp = this.ket.callTime.get(member.user.id),
            user = await db.get(`/users/${member.id}`, true),
            callDuration = Date.now() - initialTimestamp;

        if (isNaN(callDuration)) return;
        await db.set(`/users/${member.id}`, { callTime: `sql (oldData.callTime || 0) + ${callDuration}` });
        this.ket.callTime.delete(member.user.id);
    }
}