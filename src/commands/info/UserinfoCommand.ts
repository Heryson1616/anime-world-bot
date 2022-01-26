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
                roles: [],
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
        let user: any = await this.ket.findUser(ctx.env, ctx.args[0])
        if (!user) user = ctx.author
        let userdb = await global.session.db.users.find(user.id),
            cacheCallDuration = this.ket.callTime.get(user.id) ? Date.now() - this.ket.callTime.get(user.id) : 0,
            embed = new EmbedBuilder()
                .setAuthor(user.tag, user.dynamicAvatarURL('jpg'))
                .setTitle(`Informações do Usuário`)
                .setColor('yellow')
                .addField('ID:', user.id, true, 'css')
                .addField('Registros feitos: ', ` ${!userdb.registros ? 0 : userdb.registros}`, true, 'css')
                .addField('Tempo em Call: ', `# ${moment.duration((userdb.calltime ? Number(userdb.calltime) : 0) + cacheCallDuration).format('dd[d] hh[h] mm[m] ss[s] S[ms]')}`, true, 'md')
        return this.ket.send({ context: ctx.env, content: { embeds: [embed.build()] } });
    }
}