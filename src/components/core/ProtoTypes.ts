import KetClient from "../../KetClient";
import Eris from "eris";
import axios from "axios";

const
	moment = require('moment'),
	{ EmbedBuilder, Decoration } = require('../Commands/CommandStructure'),
	{ getEmoji } = Decoration;

module.exports = class ProtoTypes {
	ket: KetClient;
	constructor(ket: KetClient) {
		this.ket = ket;
	}
	static start() {

		/* message.deleteAfter(5) */
		//@ts-ignore
		if (!Eris.Message.prototype.deleteAfter) Object.defineProperty(Eris.Message.prototype, 'deleteAfter', {
			value: function (time) {
				setTimeout(() => this.delete().catch(() => { }), Number(time) * 1000)
			}
		})

		//@ts-ignore
		if (!Eris.Member.prototype.mute) Object.defineProperty(Eris.Member.prototype, 'mute', {
			value: async function mutar(time, reason) {
				let data = await axios({
					"url": `https://${this.user._client.requestHandler.options.domain}${this.user._client.requestHandler.options.baseURL}/guilds/${this.guild.id}/members/${this.user.id}`,
					"headers": {
						"authorization": this.user._client._token,
						"x-audit-log-reason": reason,
						"content-type": "application/json"
					},
					data: {
						"communication_disabled_until": moment(time).format()
					},
					"method": "PATCH"
				})
				if (data.status < 200 || data.status > 300)
					throw new Error(`DiscordRESTError:\nStatus Code: ${data.status}\n${data.statusText}`);
				else return true;
			}
		})

		/* user.tag */
		//@ts-ignore
		if (!Eris.User.prototype.tag) Object.defineProperty(Eris.User.prototype, "tag", {
			get() {
				return `${this.username}#${this.discriminator}`;
			}
		});
		return;
	}
}