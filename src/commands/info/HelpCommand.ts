import KetClient from "../../KetClient";
import { SlashCommandBuilder } from "@discordjs/builders";
const { CommandStructure, Decoration } = require('../../components/Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration;

module.exports = class HelpCommand extends CommandStructure {
    ket: KetClient;
    constructor(ket: KetClient) {
        super(ket, {
            name: 'help',
            aliases: ['ajuda', '?'],
            category: 'info',
            description: "Exibe a lista de comandos",
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
        let commands = [];
        this.ket.commands.forEach(c => c.config.permissions.onlyDevs ? null : commands.push(`\`${ctx.user.prefix}${c.config.name}\`\nㅤㅤ\`${c.config.description}\``))
        this.ket.send({
            context: ctx.env, content: {
                embeds: [{
                    color: getColor('red'),
                    title: `Olá ${ctx.author.tag}`,
                    description: `**pau no seu cu seu otário, bah, tchê, trilegal, textinho fofinho de comando de help bah\n\n${getEmoji('ruby').mention}ㅤLista de Comandos:**\n\n>>> ${getEmoji('setaRed').mention} ${commands.join(`\n${getEmoji('setaRed').mention} `)}`,
                    footer: {
                        icon_url: ctx.author.dynamicAvatarURL('jpg')
                    }
                }]
            }
        });
    }
}