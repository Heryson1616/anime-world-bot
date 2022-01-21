import KetClient from "../../KetClient";
import { SlashCommandBuilder } from "@discordjs/builders";
const { CommandStructure, Decoration } = require('../../components/Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration;

module.exports = class HelpCommand extends CommandStructure {
    ket: KetClient;
    constructor(ket: KetClient) {
        super(ket, {
            name: 'registry',
            aliases: ['registrar', 'r'],
            category: 'admin',
            cooldown: 1,
            permissions: {
                user: [],
                bot: [],
                onlyDevs: false
            },
            access: {
                DM: true,
                Threads: true
            },
            dontType: false,
            data: new SlashCommandBuilder()
        })
    }
    async execute(ctx) {
        ctx.channel.createMessage({
            embed: {
                thumbnail: { url: this.client.dynamicAvatarURL('jpg') },
                color: getColor('red'),
                title: `Olá ${ctx.author.username}`,
                description: 'pau no seu cu seu otário',
            }
        })
    }
}