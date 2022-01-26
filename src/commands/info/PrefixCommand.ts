import KetClient from "../../KetClient";
import { SlashCommandBuilder } from "@discordjs/builders";
const { CommandStructure, Decoration } = require('../../components/Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration;

module.exports = class PrefixCommand extends CommandStructure {
    ket: KetClient;
    constructor(ket: KetClient) {
        super(ket, {
            name: 'prefix',
            aliases: ['prefixo', 'setprefix'],
            category: 'info',
            description: "Altera o prefixo (por usuário)",
            cooldown: 1,
            permissions: {
                user: [],
                bot: [],
                roles: [],
                onlyDevs: false
            },
            access: {
                DM: true,
                Threads: true
            },
            dontType: false,
            data: new SlashCommandBuilder()
                .addStringOption(option =>
                    option.setName('prefix')
                        .setDescription('The prefix')
                        .setRequired(true)
                )
        })
    }
    async execute(ctx) {
        if (!ctx.args[0]) return this.ket.send({ context: ctx.env, emoji: 'errado', content: `Comando incompleto, a maneira certa de usar é: \`${ctx.user.prefix}${ctx.commandName} prefixo (no máximo 3 caracteres)\`` });
        await global.session.db.users.update(ctx.uID, { prefix: ctx.args[0].slice(0, 3) })
        await this.ket.send({
            context: ctx.env, emoji: 'autorizado', content: {
                embeds: [{
                    title: 'Prefixo alterado com sucesso!',
                    color: getColor('green'),
                    description: `Agora o seu prefixo é \`${ctx.args[0].slice(0, 3)}\``,
                    footer: {
                        text: ctx.author.tag,
                        icon_url: ctx.author.dynamicAvatarURL('jpg')
                    }
                }]
            }
        })
    }
}