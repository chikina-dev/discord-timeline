import { Client, ForumChannel, Events, TextChannel } from "discord.js";
import Settings from "../setting";
import type { ThreadsType } from "./types";
import { handleThreadCreate, handleThreadUpdate, fetchAllThreads } from "./threads";
import { handleMessageCreate } from "./messages";

async function Timeline(client: Client) {
  const logChannel = client.channels.cache.get(Settings.DISCORD_LOG_CHANNEL_ID) as TextChannel;
  const channels = Settings.DISCORD_FORUM_CHANNEL_ID
    .map(id => client.channels.cache.get(id))
    .filter((c): c is ForumChannel => !!c);
  const threadArrays = await Promise.all(channels.map(fetchAllThreads));
  const threads: ThreadsType[] = threadArrays.flat();

  // スレッド管理
  client.on(Events.ThreadCreate, (thread) => handleThreadCreate(client, logChannel, threads, thread));
  client.on(Events.ThreadUpdate, (oldThread, newThread) => handleThreadUpdate(threads, oldThread, newThread));

  // メッセージ転送
  client.on(Events.MessageCreate, (message) => handleMessageCreate(client, logChannel, threads, message));
}

export default Timeline;
