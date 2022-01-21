import KetClient from "../../KetClient";
import { SlashCommandBuilder } from "@discordjs/builders";
const { CommandStructure } = require('../../components/Commands/CommandStructure')

module.exports = class UnmuteCommand extends CommandStructure {
    ket: KetClient;
    constructor(ket: KetClient) {
        super(ket, {
            name: 'unmute',
            aliases: [],
            category: 'admin',
            cooldown: 1,
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
            data: new SlashCommandBuilder().addUserOption(option =>
                option.setName("user")
                    .setDescription("User to get info")
                    .setRequired(true)
            )
        })
    }
    async execute(ctx) {

    }
}