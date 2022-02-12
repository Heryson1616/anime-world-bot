export { };
import { CommandInteraction } from "eris";
import KetClient from "../KetClient";
const
    db = global.db,
    KetUtils = new (require('../components/KetUtils'))(),
    { getContext, Decoration } = require('../components/Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration;

module.exports = class InteractionCreateEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start(interaction: any) {
        if (!(interaction instanceof CommandInteraction)) return;
        const ket = this.ket
        let user = await db.get(`/users/${interaction.member.id}`, true),
            ctx = getContext({ ket, interaction, user });

        if (user.banned) return;

        let args: string[] = [],
            commandName: string = interaction.data.name,
            command = ket.commands.get(commandName) || ket.commands.get(ket.aliases.get(commandName));

        if (!command && (command = await KetUtils.commandNotFound(ctx, commandName)) === false) return;
        function getArgs(option) {
            if (!option.value) args.push(option.name);
            else args.push(option.value)
            return option?.options ? option.options.forEach(op => getArgs(op)) : null
        }
        interaction.data?.options?.forEach((option: any) => getArgs(option))


        ctx = getContext({ ket, user, interaction, args, command, commandName })

        await KetUtils.checkCache(ctx);

        if (await KetUtils.checkPermissions({ ctx }) === false) return;
        if (ctx.command.permissions.onlyDevs && !ket.config.DEVS.includes(ctx.uID)) return this.ket.send({
            context: interaction, emoji: 'errado', content: {
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
                await interaction.defer().catch(() => { });
                await command.execute(ctx);
                KetUtils.sendCommandLog(ctx)
            } catch (error) {
                return KetUtils.CommandError(ctx, error)
            }
        })
    }
}