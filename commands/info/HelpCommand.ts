export { };
import Eris from "eris";
const { CommandStructure, Decoration } = require('../../components/Commands/CommandStructure'),
    Deco = new Decoration;

module.exports = class HelpCommand extends CommandStructure {
    client: any;
    constructor(client: Eris.Client) {
        super(client, {
            name: 'help',
            aliases: ['h', '?'],
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
        message.channel.createMessage({
            embed: {
                thumbnail: { url: this.client.dynamicAvatarURL('jpg') },
                color: Deco.getColor('red'),
                title: `Olá ${message.author.username}`,
                description: 'pau no seu cu seu otário',
            }
        })
    }
}