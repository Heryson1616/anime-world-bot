import { Message } from "eris";
import KetClient from "../KetClient";
delete require.cache[require.resolve('../components/KetUtils')];
const
    db = global.session.db,
    KetUtils = new (require('../components/KetUtils'))(),
    { getContext, Decoration } = require('../components/Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration;

module.exports = class MessageCreateEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start(message: Message) {
        if (message.author?.bot || !message.guildID || message.channel.type === 1) return;
        const ket = this.ket
        let user = await db.get(`/users/${message.author.id}`, true),
            ctx = getContext({ ket, message, user });

        if (user?.banned) return;

        const regexp = new RegExp(`^(${((!user || !user.prefix) ? this.ket.config.DEFAULT_PREFIX : user.prefix).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}|<@!?${this.ket.user.id}>)( )*`, 'gi')
        if (!message.content.match(regexp)) return;
        let args: string[] = message.content.replace(regexp, '').trim().split(/ /g),
            commandName: string | null = args.shift().toLowerCase(),
            command = ket.commands.get(commandName) || ket.commands.get(ket.aliases.get(commandName));

        if (!command && (command = await KetUtils.commandNotFound(ctx, commandName)) === false) return;
        ctx = getContext({ ket, user, message, args, command, commandName })

        await KetUtils.checkCache(ctx);

        if (await KetUtils.checkPermissions({ ctx }) === false) return;
        if (ctx.command.permissions.onlyDevs && !ket.config.DEVS.includes(ctx.uID)) return this.ket.send({
            context: message, emoji: 'errado', content: {
                embeds: [{
                    color: getColor('red'),
                    description: global.t('events:isDev')
                }]
            }
        })
        if (ctx.command.permissions.roles[0]) {
            let cRoles = ctx.command.permissions.roles.map(r => ctx.member.roles.includes(r) ? r : false)
            if (cRoles.includes(false) && !ctx.member.permissions.has('administrator')) return this.ket.send({ context: ctx.env, emoji: 'errado', content: `Sai randola, só <@&${ctx.command.permissions.roles.join('> e <@&')}> pode fazer isso` });
        }

        return new Promise(async (res, rej) => {
            try {
                ctx.command.dontType ? null : await ctx.channel.sendTyping();
                await command.execute(ctx);
                KetUtils.sendCommandLog(ctx)
            } catch (error) {
                return KetUtils.CommandError(ctx, error)
            }
        })
    }
}
