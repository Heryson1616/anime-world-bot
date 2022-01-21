import KetClient from "../../KetClient";
import { SlashCommandBuilder } from "@discordjs/builders";
const { EmbedBuilder, CommandStructure, Decoration } = require('../../components/Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration,
    moment = require('moment');

module.exports = class UserinfoCommand extends CommandStructure {
    ket: KetClient;
    constructor(ket: KetClient) {
        super(ket, {
            name: 'userinfo',
            aliases: [],
            category: 'info',
            cooldown: 1,
            permissions: {
                user: [],
                bot: [],
                onlyDevs: false
            },
            access: {
                DM: false,
                Threads: true
            },
            dontType: false,
            data: new SlashCommandBuilder().addUserOption(option =>
                option.setName("user")
                    .setDescription("User to get info")
                    .setRequired(true)
            )
        })
    }
    async execute(ctx) {
        let member = await this.finduser(ctx.env, ctx.args[0], true),
            embed = new EmbedBuilder()
                .setAuthor(member.user.username, member.user.dynamicAvatarURL('jpg'))
                .setTitle(`Informações do Usuário`)
                .addField('TAG:', `\`${member.user.tag}\``, true)
                .addField('ID:', `\`${member.user.id}\``, true)
                .addField('Idade da conta:', `${member.user.createdAt}`);
        member ? embed.addField('Está neste servidor desde:', member.joinedAt, true) : null;
    }
}