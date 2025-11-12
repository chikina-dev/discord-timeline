

export type SettingType = {
  DISCORD_BOT_TOKEN: string;
  DISCORD_BOT_NAME: string;
  DISCORD_FORUM_CHANNEL_ID: string[];
  DISCORD_LOG_CHANNEL_ID: string;
}

function getEnv(key: string): string | undefined {
	const raw = process.env[key];
	if (!raw) return undefined;
	return raw.replace(/^"(.*)"$/, "$1").trim();
}

export function getSettings(): SettingType {
  const DISCORD_BOT_TOKEN = getEnv("DISCORD_BOT_TOKEN");
  const DISCORD_BOT_NAME = getEnv("DISCORD_BOT_NAME");
  const NODE_ENV = getEnv("NODE_ENV") || "development";
  const prod_forum_channelIds = ["1320728461937217578", "1320645439699026000"];
  const prod_log_channelId = "1326392798529982525";
  const dev_forum_channelIds = ["1320666925365465138", "1386000000965804063"];
  const dev_log_channelId = "1321004091710902333";
  if (!DISCORD_BOT_TOKEN) {
    console.error("Missing DISCORD_BOT_TOKEN in environment variables");
    process.exit(1);
  }
  if (!DISCORD_BOT_NAME) {
    console.error("Missing DISCORD_BOT_NAME in environment variables");
    process.exit(1);
  }
  return {
    DISCORD_BOT_TOKEN,
    DISCORD_BOT_NAME,
    DISCORD_FORUM_CHANNEL_ID: NODE_ENV === "production" ? prod_forum_channelIds : dev_forum_channelIds,
    DISCORD_LOG_CHANNEL_ID: NODE_ENV === "production" ? prod_log_channelId : dev_log_channelId,
  };
}
const Settings = getSettings();

export default Settings;