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
            description: "Exibe informações sobre um usuário",
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
        let member: any = await this.ket.findUser(ctx.env, ctx.args[0], true);
        !member ? member = ctx.member : null;
        let user = await global.session.db.users.find(member.user.id);
        if (!member) return this.ket.send({ context: ctx.env, emoji: 'negado', content: `Usuário não encontrado!` });

        let embed = new EmbedBuilder()
            .setAuthor(member.user.username, member.user.dynamicAvatarURL('jpg'))
            .setTitle(`Informações do Usuário`)
            .setColor('yellow')
            .addField('TAG:', `# ${member.user.tag}`, true, 'md')
            .addField('ID:', member.user.id, true, 'css')
            .addField('Conta criada em:', `${moment.utc(member.user.createdAt).format('LLLL')}`, false, 'fix')
            .addField('Total de registros: ', ` ${!user.registros ? 0 : user.registros}`, true, 'css')

        return this.ket.send({ context: ctx.env, content: { embeds: [embed.build()] } });
    }
}