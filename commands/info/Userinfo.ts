export { };
import Eris from "eris";
const { EmbedBuilder, CommandStructure, Decoration } = require('../../components/Commands/CommandStructure'),
    Deco = new Decoration(),
    moment = require('moment'),
    axios = require('axios');

module.exports = class UserinfoCommand extends CommandStructure {
    client: any;
    constructor(client: Eris.Client) {
        super(client, {
            name: 'userinfo',
            aliases: ['messages', 'info'],
            category: 'info',
            cooldown: 3,
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
            slashData: null
        })
    }
    async execute({ message, args }) {
        let user = await this.finduser(message, args),
            member = message.channel.guild.members.get(user.id),
            embed = new EmbedBuilder()
                .setAuthor(user.username, user.dynamicAvatarURL('jpg'))
                .setTitle(`Informações do Usuário`)
                .addField('TAG:', `\`${user.tag}\``, true)
                .addField('ID:', `\`${user.id}\``, true)
                .addField('Idade da conta:', `${user.createdAt}`);
        member ? embed.addField('Está neste servidor desde:', member.joinedAt, true) : null;
        embed
            .addField(`Mensagens enviadas nesse servidor:`,)


    }
}