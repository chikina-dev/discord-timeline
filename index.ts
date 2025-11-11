import { Client, Events, GatewayIntentBits } from "discord.js";
import Timeline from "./src/timeline";

function getEnv(key: string): string | undefined {
	const raw = process.env[key];
	if (!raw) return undefined;
	return raw.replace(/^"(.*)"$/, "$1").trim();
}

const DISCORD_TOKEN = getEnv("DISCORD_BOT_TOKEN");
if (!DISCORD_TOKEN) {
	console.error(
		"Missing Discord token. Set DISCORD_BOT_TOKEN in the environment or via --env-file .env"
	);
	process.exit(1);
}

const BOT_NAME = getEnv("DISCORD_BOT_NAME");

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
	if (BOT_NAME && BOT_NAME !== client.user?.username) {
		console.error("設定されたBOT名とログインしたBOT名が一致しません。");
		process.exit(1);
	}
	main();
});

client.login(DISCORD_TOKEN).catch((error) => {
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
