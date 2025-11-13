import { Client, ForumChannel, Events, EmbedBuilder, TextChannel } from "discord.js";
import { styleText } from "util";
import Settings from "../setting";

type ThreadsType = {
  name: string;
  id: string;
}

async function Timeline(client: Client) {
  const logChannel = client.channels.cache.get(Settings.DISCORD_LOG_CHANNEL_ID) as TextChannel;
  const channels = Settings.DISCORD_FORUM_CHANNEL_ID
    .map(id => client.channels.cache.get(id))
    .filter((c): c is ForumChannel => !!c);
  const threadArrays = await Promise.all(channels.map(getThreads));
  const threads = threadArrays.flat();
  client.on(Events.ThreadCreate, async (thread) => {
    if (thread.parentId && Settings.DISCORD_FORUM_CHANNEL_ID.includes(thread.parentId)) {
      console.log("新規スレッド検出:", thread.name);
      if (!threads.find(t => t.id === thread.id)) {
        const channel = client.channels.cache.get(thread.parentId) as ForumChannel;
        const embed = new EmbedBuilder()
          .setTitle(`${channel.name}にて新規スレッド`)
          .setDescription(`スレッド名: ${thread.name}`)
          .setTimestamp(new Date());
        await logChannel.send({ embeds: [embed] });
        threads.push({
          name: thread.name,
          id: thread.id,
        });
      }
    }
  });
  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const thread = threads.find(t => t.id === message.channelId);
    if (!thread) return;

    const content = message.content || null;
    const attachments = [...message.attachments.values()];
    getLog(content);

    const username = message.member?.displayName || message.author.displayName || message.author.username;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: username,
        iconURL: message.author.displayAvatarURL()
      })
      .setTitle(thread.name)
      .setDescription(content)
      .setColor("Grey")
      .setURL(`https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`)
      .setTimestamp(message.createdAt)
      .setImage(attachments[0]?.url ? attachments[0]?.url : null)

    const embeds = message.embeds;

    const isIncludeUrl = (content?.match(/https?:\/\/\S+/g)?.length ?? 0) > 0;
    if (isIncludeUrl) {
      setTimeout(async () => {
        const target = client.channels.cache.get(message.channelId) as TextChannel;
        const fetchedMessage = await target.messages.fetch(message.id);
        const newEmbeds = fetchedMessage.embeds;
        for (const e of newEmbeds) {
          if (!embeds.find(em => em.url === e.url)) {
            logChannel.send({ embeds: [e] });
          }
        }
      }, 1000);
    }

    await logChannel.send({ embeds: [embed] });
    if (embeds.length > 0) {
      await logChannel.send({ embeds: embeds });
    }
  })
}

async function getThreads(channel: ForumChannel): Promise<ThreadsType[]> {
  const threadIDs: ThreadsType[] = [];
  const activeThreads = await channel.threads.fetchActive();
  const archivedThreads = await channel.threads.fetchArchived();

  const threads = [...activeThreads.threads.values(), ...archivedThreads.threads.values()];

  for (const thread of threads) {
    threadIDs.push({
      name: thread.name,
      id: thread.id,
    });
  }

  return threadIDs;
}

function getLog(content: string | null) {
	console.log(styleText('bgWhiteBright', styleText('black','----- Get Log -----')));
	console.log(styleText('yellow', `日付: ${new Date().toLocaleString()}`));
  console.log(styleText('white', `データ: ${content}\n`));
}


export default Timeline;
