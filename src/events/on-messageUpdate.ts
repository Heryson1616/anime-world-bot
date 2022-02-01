import { Message } from "eris";
import KetClient from "../KetClient";
const KetUtils = new (require('../components/KetUtils'))(),
    db = global.db;

module.exports = class MessageUpdateEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start(newMessage: any, oldMessage: Message) {
        if ((String(oldMessage?.content).trim() === String(newMessage?.content).trim() && !newMessage.editedTimestamp) || newMessage.author?.bot) return;
        return this.ket.emit("messageCreate", newMessage);
    }
}