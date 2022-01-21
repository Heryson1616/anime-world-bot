export { };
import Eris from "eris";
const { CommandStructure, Decoration } = require('../../components/Commands/CommandStructure'),
    Deco = new Decoration(),
    Collector = require('../../components/Commands/EventCollector');

module.exports = class MuteCommand extends CommandStructure {
    client: any;
    constructor(client: Eris.Client) {
        super(client, {
            name: 'mute',
            aliases: ['mutar', 'silenciar'],
            category: 'admin',
            cooldown: 3,
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
            slashData: null
        })
    }
    async execute({ message, args }) {
        let client = this.client,
            member: Eris.Member = await this.findUser(message, args, true),
            role = message.channel.guild.roles.find(r => r.name.toLowerCase().includes('muted'));

        if (!member || member.id === message.author.id) return message.reply('Usuário não encontrado', 'cancelar');
        if (!role) {
            message.channel.guild.createRole({
                name: 'muted'
            })
        }
        if (member.roles.includes(role.id)) return message.reply('Ops, este usuário já está mutado', 'cancelar');

        let msg = await message.reply({
            embed: {
                title: `🔇 | Você está prestes a mutar ${member.user.username}`,
                color: Deco.getColor('purple'),
                thumbnail: { url: member.user.dynamicAvatarURL('jpg') },
                description: `${Deco.getEmoji('info').mention} | Tem certeza de que deseja fazer isso? Ele será desconectado das calls e ficará impedido de conversar em chats do servidor.`,
            }
        })
        await msg.addReaction(Deco.getEmoji('confirmar').reaction)
        await msg.addReaction(Deco.getEmoji('cancelar').reaction)
        const filter = async (msgConfirm: Eris.Message, emoji: Eris.Emoji, reactor: Eris.Member) => {
            if (msgConfirm.id != msg.id || (emoji.id !== Deco.getEmoji('confirmar').id && emoji.id !== Deco.getEmoji('cancelar').id) || reactor.user.id !== message.author.id) return false;
            await msgConfirm.removeReactions().catch(() => { });
            switch (emoji.id) {
                case Deco.getEmoji('confirmar').id:
                    member.addRole(role.id).then(() => {
                        msg.edit({
                            embed: {
                                title: `Usuário silenciado!`,
                                color: Deco.getColor('pink'),
                                thumbnail: { url: member.user.dynamicAvatarURL('jpg') },
                                description: `${member.user.mention} foi punido com o motivo: \`${args[1] ? args.slice(1).join(' ') : 'Sem motivo informado'}\``,
                            },
                            components: []
                        })
                    }).catch(() => { });
                    break
                case Deco.getEmoji('cancelar').id:
                    msg.edit({
                        embed: {
                            title: `Operação cancelada`,
                            color: Deco.getColor('red'),
                            thumbnail: { url: member.user.dynamicAvatarURL('jpg') },
                            description: `${member.user.mention} se salvou dessa vez... Mas não faça coisas erradas novamente.`,
                        },
                        components: []
                    })
                    break
            }
        }

        (new Collector).collect({ client, eventName: 'messageReactionAdd', filter, time: 120 * 1000 })

    }
}