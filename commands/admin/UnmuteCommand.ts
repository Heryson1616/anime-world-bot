export { }
import Eris from "eris"
const { CommandStructure } = require('../../components/Commands/CommandStructure')

module.exports = class UnmuteCommand extends CommandStructure {
    client: any;
    constructor(client: Eris.Client) {
        super(client, {
            name: 'unmute',
            aliases: ['desmute', 'desmutar'],
            category: 'admin',
            cooldown: 3,
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
            slashData: null
        })
    }
    async execute({ message, args }) {

    }
}