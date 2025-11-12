import { Client, Events, GatewayIntentBits } from "discord.js";
import Timeline from "./src/timeline";
import Settings from "./setting";

const client: Client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

const message = "通知";

client.once(Events.ClientReady, (c) => {
	console.log(`起動しました ログインタグは ${c.user.tag}`);
	if (Settings.DISCORD_BOT_NAME !== client.user?.username) {
		console.error("設定されたBOT名とログインしたBOT名が一致しません。");
		process.exit(1);
	}
	main();
});

client.login(Settings.DISCORD_BOT_TOKEN).catch((error) => {
	console.error("ログインに失敗しました:", error);
	process.exit(1);
});

function main() {
	try {
		client.user?.setActivity(message, { type: 0 });

		Timeline(client);
	} catch (error) {
		console.error("An error occurred:", error);
		process.exit(1);
	}
}
