import { ComponentInteraction } from "eris";
import EventCollector from "../../components/Commands/EventCollector";
import { SlashCommandBuilder } from "@discordjs/builders";
const
    { CommandStructure } = require('../../components/Commands/CommandStructure'),
    { Decoration } = require('../../components/Commands/CommandStructure'),
    { getEmoji, getColor } = Decoration;

module.exports = class RegistryCommand extends CommandStructure {
    constructor(ket) {
        super(ket, {
            name: 'registry',
            aliases: ['registrar', 'r'],
            category: 'admin',
            description: "Registra um random gay",
            cooldown: 1,
            permissions: {
                user: [],
                bot: ['administrator'],
                roles: ['930518575138078811'],
                onlyDevs: false
            },
            access: {
                DM: false,
                Threads: true
            },
            dontType: false,
            data: new SlashCommandBuilder().addUserOption(option =>
                option.setName("user")
                    .setDescription("A user to be registred")
                    .setRequired(true)
            )
        })
    }
    async execute(ctx) {
        let member = await this.ket.findUser(ctx.env, ctx.args[0], true),
            db = global.session.db,
            ket = this.ket;
        if (!member || member.id === ctx.uID) return this.ket.send({ context: ctx.env, emoji: 'errado', content: `Usuário não encontrado!` });

        let roles = [],
            template = {
                title: `${getEmoji('registro').mention} Menu de Registro`,
                author: {
                    name: member.user.username,
                    icon_url: member.user.dynamicAvatarURL('png')
                },
                color: parseInt('ffffff', 16),
                footer: {
                    text: `Registrador: ${ctx.author.tag}`,
                    icon_url: ctx.author.dynamicAvatarURL('png')
                }
            },
            registryButton = { type: 2, label: "Registrar", emoji: { name: "verificadoRoxo", id: "917431176745091072" }, style: 1, custom_id: `registry` },
            infos = `Usuário: ${member.user.mention}\nRegistrador:${ctx.author.mention}\n\nCargos adicionados: {{roles}}`;
        let msgObj1 = {
            embeds: [{ ...template, description: `${getEmoji('seta').mention} Gênero:\n> ${getEmoji('um').mention} <@&930285113206521886>\n> ${getEmoji('dois').mention} <@&930285119024005190>\n> ${getEmoji('tres').mention} <@&930285116553576498>\n\nCargos adicionados: ${!roles[0] ? 'Nenhum' : roles.join(', ')}` }],
            components: [{
                type: 1,
                components: [
                    { type: 2, label: "Mulher", emoji: { name: "femea", id: "917220529801416746" }, style: 4, custom_id: `femea` },
                    { type: 2, label: "Homem", emoji: { name: "macho", id: "917221203993829456" }, style: 1, custom_id: `macho` },
                    { type: 2, label: "Não binário", emoji: { name: "naobinario", id: "917220566946173000" }, style: 3, custom_id: `naobinario` }]
            }]
        },
            msgObj2 = {
                embeds: [{ ...template, description: `${getEmoji('seta').mention} Idade:\n> ${getEmoji('um').mention} <@&930468809331052544>\n> ${getEmoji('dois').mention}<@&930468848434544681>\n\nCargos adicionados: {{roles}}` }],
                components: [{
                    type: 1, components: [
                        { type: 2, label: "+18", style: 4, custom_id: `aboveage` },
                        { type: 2, label: "-18", style: 1, custom_id: `underage` }
                    ]
                }]
            },
            msgObj3 = {
                embeds: [{ ...template, description: `${getEmoji('seta').mention} Sexualidade:\n> ${getEmoji('um').mention} <@&930515464973590569>\n> ${getEmoji('dois').mention} <@&930515507822592031>\n\nCargos adicionados: {{roles}}` }],
                components: [{
                    type: 1, components: [
                        { type: 2, label: "Hétero", style: 3, custom_id: `hetero` },
                        { type: 2, label: "LGBT+", style: 4, custom_id: `lgbt` },
                        registryButton
                    ]
                }]
            },
            msgObj4 = {
                embeds: [{ ...template, description: `${getEmoji('seta').mention} Estado Civil:\n> ${getEmoji('um').mention} <@&930468881468882964>\n> ${getEmoji('dois').mention} <@&930469038625275915>\n> ${getEmoji('tres').mention} <@&930469098834497546>\n\nCargos adicionados: {{roles}}` }],
                components: [{
                    type: 1, components: [
                        { type: 2, label: "Solteiro", style: 1, custom_id: `solteiro` },
                        { type: 2, label: "Namorando", style: 3, custom_id: `namorando` },
                        { type: 2, label: "Casado", style: 4, custom_id: `casado` },
                        registryButton
                    ]
                }]
            },
            msgObj5 = {
                embeds: [{ ...template, title: `${getEmoji('registro').mention} Usuário registrado`, description: infos }],
                components: []
            }

        let msg = await this.ket.send({ context: ctx.env, content: msgObj1 });

        let filter = async (interaction) => {
            if (!(interaction instanceof ComponentInteraction) || interaction.data.component_type !== 2 || interaction.message.id != msg.id) return false;
            if (interaction.member.user.id !== ctx.uID) return await interaction.createMessage({ content: 'Você não tem permissão para isso', flags: 64 });
            await interaction.deferUpdate();
            const filtrarEmbed = async (embed) => {
                embed.embeds[0].description = embed.embeds[0].description.replace('{{roles}}', roles[0] ? roles.join(', ') : 'Nenhum');
                await msg.edit(embed);
            }

            switch (interaction.data.custom_id) {
                case 'macho': roles.push('<@&930285119024005190>');
                    await filtrarEmbed(msgObj2);
                    break;
                case 'femea': roles.push('<@&930285113206521886>');
                    await filtrarEmbed(msgObj2);
                    break;
                case 'naobinario': roles.push('<@&930285116553576498>');
                    await filtrarEmbed(msgObj2);
                    break;
                case 'aboveage': roles.push('<@&930468809331052544>');
                    await filtrarEmbed(msgObj3);
                    break
                case 'underage': roles.push('<@&930468848434544681>');
                    await filtrarEmbed(msgObj3);
                    break;
                case 'hetero': roles.push('<@&930515464973590569>');
                    await filtrarEmbed(msgObj4);
                    break;
                case 'lgbt': roles.push('<@&930515507822592031>');
                    await filtrarEmbed(msgObj4);
                    break;
                case 'solteiro': roles.push('<@&930468881468882964>');
                    registry();
                    break;
                case 'namorando': roles.push('<@&930469038625275915>');
                    registry();
                    break;
                case 'casado': roles.push('<@&930469098834497546>');
                    registry();
                    break;
                case 'registry': registry();
                    break;
            }
            async function registry() {
                await filtrarEmbed(msgObj5);
                EventCollector.stop();
                await member.addRole('930113167365914685');
                roles.forEach(async r => {
                    let role = ctx.guild.roles.get(r.replace('<@&', '').replace('>', ''));
                    await member.removeRole('929775445581373480');
                    await member.addRole(role.id);
                })
                await db.users.update(ctx.uID, { registros: 'sql registros + 1' });
                ket.createMessage(ket.config.channels.registroLogs, {
                    embed: {
                        title: `${getEmoji('badge').mention} Usuário registrado!`,
                        color: getColor('#050505'),
                        author: {
                            name: member.user.tag,
                            icon_url: member.user.dynamicAvatarURL('jpg')
                        },
                        description: `**・Usuário(a):** ${member.user.mention} (ID: ${member.user.id})\n**・Registrador:** ${ctx.author.mention}\n**・Total de registros:** \`${Number(ctx.user.registros) + 1}\`\n**${getEmoji('add').mention} Cargos adicionados:**\n${roles.join(', ')}`,
                        footer: {
                            text: `Registros | ${ctx.guild.name}`,
                            icon_url: ctx.author.dynamicAvatarURL('jpg')
                        }
                    }
                })
            }
        }

        EventCollector.collect(this.ket, 'interactionCreate', filter, 120_000, () => msg.delete().catch(() => { }));
    }
}