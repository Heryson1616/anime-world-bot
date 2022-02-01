import { Message, Webhook } from "eris";
import { inspect } from "util";
import axios from "axios";
import DidYouMean from "didyoumean";
const
    moment = require('moment'),
    db = global.db,
    { Decoration, EmbedBuilder } = require('./Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration;

module.exports = class Utils {
    constructor() { }

    async checkCache(ctx) {
        if (!ctx.ket.users.has(ctx.uID)) await ctx.ket.getRESTUser(ctx.uID);
        if (!ctx.ket.guilds.has(ctx.gID)) await ctx.ket.getRESTGuild(ctx.gID);
        if (!ctx.guild.members.has(ctx.ket.user.id)) await ctx.guild.getRESTMember(ctx.ket.user.id);
        if (!ctx.guild.channels.has(ctx.cID)) await ctx.ket.getRESTChannel(ctx.cID);
        return;
    }

    async checkPermissions({ ctx = null, channel = null, command = null, notReply = null }) {
        let missingPermissions: string[] = [],
            t = global.t;
        channel ? ctx.channel = channel : null;
        command ? ctx.command = command : null;

        if (!ctx.channel) return false;
        if ([10, 11, 12].includes(ctx.channel.type) && !ctx.command.access.Threads) {
            ctx.ket.send({
                context: ctx.env, content: {
                    embeds: [{
                        color: getColor('red'),
                        title: `${getEmoji('sireneRed').mention} ${t('events:no-threads')}`
                    }]
                }, emoji: 'negado'
            })
            return false
        }

        missingPermissions = ctx.command.permissions.bot.filter((perm) => !ctx.me.permissions.has(perm)).map(value => t(`permissions:${value}`));

        if (missingPermissions[0]) {
            notReply ? null :
                ctx.ket.send({ context: ctx.env, content: t('permissions:missingPerms', { missingPerms: missingPermissions.join(', ') }), embed: false, emoji: 'negado' })
                    .catch(async () => {
                        let dmChannel = await ctx.author.getDMChannel();
                        dmChannel.createMessage(t('permissions:missingPerms', { missingPerms: missingPermissions.join(', ') }))
                            .catch(() => {
                                if (ctx.me.permissions.has('changeNickname')) ctx.me.edit({ nick: "pls give me some permission" }).catch(() => { });
                            });
                    });
            return false;
        } else return true;
    }

    async sendCommandLog(ctx) {
        const { ket, config, command, args, author, uID, guild, gID } = ctx
        let user = await db.get(`/users/${uID}`),
            embed = new EmbedBuilder()
                .setColor('green')
                .setTitle(`${user?.prefix}${command.name}`)
                .addField('Autor:', `${author.tag} (ID: ${author.id})`, false, 'fix')
                .addField('Servidor:', `# ${guild?.name} (ID: ${gID})`, false, 'cs')
                .addField('Argumentos:', `- ${!args[0] ? 'Nenhum argumento foi usado neste comando' : args.join(' ')}`, false, 'diff');
        ket.createMessage(config.channels.commandLogs, { embed: embed.build() });
    }

    CommandError(ctx, error) {
        const { ket, args, config, command, author, uID, guild, gID, me, channel, cID } = ctx
        ket.send({
            context: ctx.env, content: {
                embeds: [{
                    color: getColor('red'),
                    thumbnail: { url: 'https://cdn.discordapp.com/attachments/788376558271201290/918721199029231716/error.gif' },
                    description: global.t('events:error.description', { error })
                }]
            }, emoji: 'negado', flags: 64
        })

        ket.createMessage(config.channels.erros, {
            embed: {
                color: getColor('red'),
                title: `Erro no ${command.name}`,
                description: `Author: \`${author.tag}\` (ID: ${uID})\nGuild: \`${guild?.name}\` (ID: ${gID})\nChannel: \`${channel?.name}\` (ID: ${cID}, Tipo: ${channel?.type}, NSFW: ${channel?.nsfw})\nEu: Nick: \`${me?.nick}\`, Permissions: ${me?.permissions}`,
                fields: [
                    { name: 'Argumentos:', value: '```diff\n- ' + (!args[0] ? 'Nenhum argumento' : args.join(' ')).slice(0, 1000) + "\n```" },
                    { name: 'Erro:', value: '```js\n' + String(inspect(error)).slice(0, 500) + "\n```" }
                ]
            }
        })
    }

    async commandNotFound(ctx, commandName: string) {
        let totalCommands: string[] = [];
        ctx.ket.commands.forEach((cmd: any) => totalCommands.push(cmd.config.name))
        ctx.command = ctx.ket.commands.get(this.findResult(commandName, totalCommands))
        if (!ctx.command) return false;
        return ctx.command;
    }

    findResult(entrada: string, mapa: string[]) {
        const checkSimilarity = this.checkSimilarity
        function Algorithm2(str: string, array: any, threshold: number = 60) {
            return array
                .map(e => { return { e, v: checkSimilarity(str, e) } })
                .filter(({ v }) => v >= threshold / 100)
                .reduce((_, curr, i, arr) => arr[i].v > curr ? arr[i].v : curr.e, null);
        }

        DidYouMean.threshold = 0.8;
        let result = DidYouMean(entrada, mapa);
        if (!result) result = Algorithm2(entrada, mapa);
        return result;
    }

    checkSimilarity(str1: string, str2: string) {
        if (str1 === str2) return 1.0;

        const len1 = str1.length,
            len2 = str2.length;

        const maxDist = ~~(Math.max(len1, len2) / 2) - 1;
        let matches = 0;

        const hash1 = [];
        const hash2 = [];

        for (var i = 0; i < len1; i++)
            for (var j = Math.max(0, i - maxDist); j < Math.min(len2, i + maxDist + 1); j++)
                if (str1.charAt(i) === str2.charAt(j) && !hash2[j]) {
                    hash1[i] = 1;
                    hash2[j] = 1;
                    matches++;
                    break;
                }

        if (!matches) return 0.0;

        let t = 0;
        let point = 0;

        for (var k = 0; k < len1; k++);
        if (hash1[k]) {
            while (!hash2[point])
                point++;

            if (str1.charAt(k) !== str2.charAt(point++))
                t++;
        }

        t /= 2;

        return ((matches / len1) + (matches / len2) + ((matches - t) / matches)) / 3.0;
    }
}
