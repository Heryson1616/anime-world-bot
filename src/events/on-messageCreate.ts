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
        if (message.author?.bot && !this.ket.config.TRUSTED_BOTS.includes(message.author?.id) /*|| message.channel.guild.shard.status === 'ready'*/) return;
        if (!message.guildID || message.channel.type === 1) {
            delete require.cache[require.resolve("../packages/events/_on-messageDMCreate")];
            return require("../packages/events/_on-messageDMCreate")(message, this.ket);
        };
        const ket = this.ket
        let server = await db.servers.find(message.guildID, true),
            user = await db.users.find(message.author.id),
            ctx = getContext({ ket, message, server, user });
        global.lang = user?.lang;

        if (user?.banned) return;
        if (server?.banned) return ctx.guild.leave();
        if (server?.globalchat && ctx.cID === server.globalchat) KetUtils.sendGlobalChat(ctx);

        const regexp = new RegExp(`^(${((!user || !user.prefix) ? this.ket.config.DEFAULT_PREFIX : user.prefix).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}|<@!?${this.ket.user.id}>)( )*`, 'gi')
        if (!message.content.match(regexp)) return;
        let args: string[] = message.content.replace(regexp, '').trim().split(/ /g),
            commandName: string | null = args.shift().toLowerCase(),
            command = ket.commands.get(commandName) || ket.commands.get(ket.aliases.get(commandName));

        if (!command && (command = await KetUtils.commandNotFound(ctx, commandName)) === false) return;
        ctx = getContext({ ket, user, server, message, args, command, commandName })

        await KetUtils.checkCache(ctx);
        global.lang = user?.lang;
        ctx.user = await KetUtils.checkUserGuildData(ctx);

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
            if (cRoles.includes(false)) return this.ket.send({ context: ctx.env, emoji: 'errado', content: `Sai randola, só <@&${ctx.command.permissions.roles.join('> e <@&')}> pode fazer isso` });
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
