import { Client, ForumChannel, EmbedBuilder, TextChannel, ThreadChannel } from "discord.js";
import Settings from "../setting";
import type { ThreadsType } from "./types";

export async function handleThreadCreate(
  client: Client,
  logChannel: TextChannel,
  threads: ThreadsType[],
  thread: ThreadChannel
) {
  if (!thread.parentId || !Settings.DISCORD_FORUM_CHANNEL_ID.includes(thread.parentId)) return;
  if (threads.find(t => t.id === thread.id)) return;

  console.log("新規スレッド検出:", thread.name);

  const channel = client.channels.cache.get(thread.parentId) as ForumChannel;
  const embed = new EmbedBuilder()
    .setTitle(`${channel.name}にて新規スレッド`)
    .setDescription(`スレッド名: ${thread.name}`)
    .setTimestamp(new Date());

  await logChannel.send({ embeds: [embed] });
  threads.push({ name: thread.name, id: thread.id });
}

export function handleThreadUpdate(
  threads: ThreadsType[],
  oldThread: ThreadChannel,
  newThread: ThreadChannel
) {
  if (!newThread.parentId || !Settings.DISCORD_FORUM_CHANNEL_ID.includes(newThread.parentId)) return;

  const thread = threads.find(t => t.id === newThread.id);
  if (thread && thread.name !== newThread.name) {
    console.log("スレッド名変更検出:", oldThread.name, "→", newThread.name);
    thread.name = newThread.name;
  }
}

export async function fetchAllThreads(channel: ForumChannel): Promise<ThreadsType[]> {
  const activeThreads = await channel.threads.fetchActive();
  const archivedThreads = await channel.threads.fetchArchived();
  const threads = [...activeThreads.threads.values(), ...archivedThreads.threads.values()];

  return threads.map(thread => ({ name: thread.name, id: thread.id }));
}
