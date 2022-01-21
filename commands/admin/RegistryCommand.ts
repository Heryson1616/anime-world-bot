const
    { CommandStructure } = require('../../components/Commands/CommandStructure'),
    Eris = require('eris'),
    { Decoration } = require('../../components/Commands/CommandStructure'),
    Deco = new Decoration;

module.exports = class RegistryCommand extends CommandStructure {
    constructor(client) {
        super(client, {
            name: 'registry',
            aliases: ['registrar', 'r'],
            category: 'admin',
            cooldown: 3,
            permissions: {
                user: [],
                bot: [],
                onlyDevs: false
            },
            access: {
                DM: false,
                Threads: false
            },
            dontType: false,
            slashData: null
        })
    }
    async execute({ client, message, args }) {
        const Collector = require('../../components/Commands/EventCollector');
        let member = await this.findUser(message, args, true)
        if (!member || member.id === message.author.id) return message.channel.createMessage('vou registrar um fantasma seu otário?')
        let roles = [],
            template = {
                title: `${Deco.getEmoji('registro').mention} Menu de Registro`,
                author: {
                    name: member.user.username,
                    icon_url: member.user.dynamicAvatarURL('png')
                },
                color: parseInt('ffffff', 16),
                footer: {
                    text: `Registrador: ${message.author.tag}`,
                    icon_url: message.author.dynamicAvatarURL('png')
                }
            },
            registryButton = { type: 2, label: "Registrar", emoji: { name: "verificadoRoxo", id: "917431176745091072" }, style: 1, custom_id: `registry` },
            infos = `Usuário: ${member.user.mention}\nRegistrador:${message.author.mention}\n\nCargos adicionados: {{roles}}`;
        let msgObj1 = {
            embed: { ...template, description: `${Deco.getEmoji('seta').mention} Gênero:\n> ${Deco.getEmoji('um').mention} <@&872438930925035570>\n> ${Deco.getEmoji('dois').mention} <@&872438929096327179>\n> ${Deco.getEmoji('tres').mention} <@&872438930086178816>\n\nCargos adicionados: ${!roles[0] ? 'Nenhum' : roles.join(', ')}` },
            components: [{
                type: 1,
                components: [
                    { type: 2, label: "Mulher", emoji: { name: "femea", id: "917220529801416746" }, style: 4, custom_id: `femea` },
                    { type: 2, label: "Homem", emoji: { name: "macho", id: "917221203993829456" }, style: 1, custom_id: `macho` },
                    { type: 2, label: "Não binário", emoji: { name: "naobinario", id: "917220566946173000" }, style: 3, custom_id: `naobinario` }]
            }]
        },
            msgObj2 = {
                embed: { ...template, description: `${Deco.getEmoji('seta').mention} Idade:\n> ${Deco.getEmoji('um').mention} <@&872438931608723477>\n> ${Deco.getEmoji('dois').mention}<@&872438931529027594>\n\nCargos adicionados: {{roles}}` },
                components: [{
                    type: 1, components: [
                        { type: 2, label: "-18", style: 1, custom_id: `underage` },
                        { type: 2, label: "+18", style: 4, custom_id: `aboveage` }
                    ]
                }]
            },
            msgObj3 = {
                embed: { ...template, description: `${Deco.getEmoji('seta').mention} Sexualidade:\n> ${Deco.getEmoji('um').mention} <@&872447099881529354>\n> ${Deco.getEmoji('dois').mention} <@&872447099701174284>\n\nCargos adicionados: {{roles}}` },
                components: [{
                    type: 1, components: [
                        { type: 2, label: "Hétero", style: 3, custom_id: `hetero` },
                        { type: 2, label: "LGBT+", style: 4, custom_id: `lgbt` },
                        registryButton
                    ]
                }]
            },
            msgObj4 = {
                embed: { ...template, description: `${Deco.getEmoji('seta').mention} Estado Civil:\n> ${Deco.getEmoji('um').mention} <@&872447098811998268>\n> ${Deco.getEmoji('dois').mention} <@&872447090561802287>\n> ${Deco.getEmoji('tres').mention} <@&872447098208006184>\n\nCargos adicionados: {{roles}}` },
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
                embed: { ...template, title: `${Deco.getEmoji('registro').mention} Usuário registrado`, description: infos },
                components: []
            }
        let msg = await message.channel.createMessage(msgObj1)
        let filter = async (interaction) => {
            if (!(interaction instanceof Eris.ComponentInteraction) || interaction.data.component_type !== 2 || interaction.message.id != msg.id) return false
            if (interaction.member.user.id !== message.author.id) return await interaction.createMessage({ content: 'Você não tem permissão para isso', flags: 64 })
            await interaction.deferUpdate()
            switch (interaction.data.custom_id) {
                case 'macho':
                    roles.push('<@&872438929096327179>')
                    msgObj2.embed.description = msgObj2.embed.description.replace('{{roles}}', roles[0] ? roles.join(', ') : 'Nenhum')
                    await msg.edit(msgObj2)
                    break
                case 'femea':
                    roles.push('<@&872438930925035570>')
                    msgObj2.embed.description = msgObj2.embed.description.replace('{{roles}}', roles[0] ? roles.join(', ') : 'Nenhum')
                    await msg.edit(msgObj2)
                    break
                case 'naobinario':
                    roles.push('<@&872438930086178816>')
                    msgObj2.embed.description = msgObj2.embed.description.replace('{{roles}}', roles[0] ? roles.join(', ') : 'Nenhum')
                    await msg.edit(msgObj2)
                    break
                case 'aboveage':
                    roles.push('<@&872438931529027594>')
                    msgObj3.embed.description = msgObj3.embed.description.replace('{{roles}}', roles[0] ? roles.join(', ') : 'Nenhum')
                    await msg.edit(msgObj3)
                    break
                case 'underage':
                    roles.push('<@&872438931608723477>')
                    msgObj3.embed.description = msgObj3.embed.description.replace('{{roles}}', roles[0] ? roles.join(', ') : 'Nenhum')
                    await msg.edit(msgObj3)
                    break
                case 'hetero':
                    roles.push('<@&872447099881529354>')
                    msgObj4.embed.description = msgObj4.embed.description.replace('{{roles}}', roles[0] ? roles.join(', ') : 'Nenhum')
                    await msg.edit(msgObj4)
                    break
                case 'lgbt':
                    roles.push('<@&872447099701174284>')
                    msgObj4.embed.description = msgObj4.embed.description.replace('{{roles}}', roles[0] ? roles.join(', ') : 'Nenhum')
                    await msg.edit(msgObj4)
                    break
                case 'solteiro':
                    roles.push('<@&872447098811998268>')
                    registry()
                    break
                case 'namorando':
                    roles.push('<@&872447090561802287>')
                    registry()
                    break
                case 'casado':
                    roles.push('<@&872447098208006184>')
                    registry()
                    break
                case 'registry':
                    registry()
                    break
            }
            async function registry() {
                msgObj5.embed.description = msgObj5.embed.description.replace('{{roles}}', roles.join(', '))
                await msg.edit(msgObj5)
                roles.forEach(async r => {
                    let role = message.channel.guild.roles.get(r.replace('<@&', '').replace('>', ''))
                    await member.removeRole('872316304537817149')
                    await member.addRole(role.id)
                })
            }
        }
        (new Collector).collect({ client, eventName: 'interactionCreate', filter })
    }
}