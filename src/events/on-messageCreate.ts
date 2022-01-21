export { };
import { Message } from "eris";
import KetClient from "../KetClient";
import i18next from "i18next";
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
        if (message.author?.bot) return;
        if (!message.guildID || message.channel.type === 1) {
            delete require.cache[require.resolve("../packages/events/_on-messageDMCreate")];
            return require("../packages/events/_on-messageDMCreate")(message, this.ket);
        };
        const ket = this.ket
        let user = await db.users.find(message.author.id),
            ctx = getContext({ ket, message, user }, i18next.getFixedT('pt'))

        if (user?.banned) return;

        const regexp = new RegExp(`^(${((!user || !user.prefix) ? this.ket.config.DEFAULT_PREFIX : user.prefix).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}|<@!?${this.ket.user.id}>)( )*`, 'gi')
        if (!message.content.match(regexp)) return;
        let args: string[] = message.content.replace(regexp, '').trim().split(/ /g),
            commandName: string | null = args.shift().toLowerCase(),
            command = ket.commands.get(commandName) || ket.commands.get(ket.aliases.get(commandName));
        if (!command && (command = await KetUtils.commandNotFound(ctx, commandName)) === false) return;
        ctx = getContext({ ket, user, message, args, command, commandName }, ctx.t)

        await KetUtils.checkCache(ctx);
        ctx.t = i18next.getFixedT('pt');
        ctx.user = await db.users.find(ctx.uID);

        if (await KetUtils.checkPermissions({ ctx }) === false) return;
        if (ctx.command.permissions.onlyDevs && !ket.config.DEVS.includes(ctx.uID)) return this.ket.send({
            context: message, emoji: 'negado', content: {
                embeds: [{
                    color: getColor('red'),
                    description: ctx.t('events:isDev')
                }]
            }
        })

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
