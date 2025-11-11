import { Client, ForumChannel, Events, EmbedBuilder, TextChannel } from "discord.js";
import { styleText } from "util";

type ThreadsType = {
  name: string;
  id: string;
}

async function Timeline(client: Client) {
  const channelIds = ["1320728461937217578", "1320645439699026000"];
  // const channelIds = ["1320666925365465138", "1386000000965804063"]
  const logChannelId = "1326392798529982525";
  // const logChannelId = "1321004091710902333";
  const logChannel = client.channels.cache.get(logChannelId) as TextChannel;
  const channels = channelIds
    .map(id => client.channels.cache.get(id))
    .filter((c): c is ForumChannel => !!c);
  const threadArrays = await Promise.all(channels.map(getThreads));
  const threads = threadArrays.flat();
  client.on(Events.ThreadCreate, async (thread) => {
    if (thread.parentId && channelIds.includes(thread.parentId)) {
      console.log("新規スレッド検出:", thread.name);
      if (!threads.find(t => t.id === thread.id)) {
        const channel = client.channels.cache.get(thread.parentId) as ForumChannel;
        const embed = new EmbedBuilder()
          .setTitle(`${channel.name}にて新規スレッド`)
          .setDescription(`スレッド名: ${thread.name}`)
          .setTimestamp(new Date());
        if (logChannel && logChannel.isTextBased()) {
          await logChannel.send({ embeds: [embed] });
        } else {
          console.error("Log channel is not a text channel or does not exist.");
        }
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

    const embed = new EmbedBuilder()
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.displayAvatarURL(),})
      .setTitle(thread.name)
      .setDescription(content || "No content")
      .setColor("Grey")
      .setURL(`https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`)
      .setTimestamp(message.createdAt)
      .setImage(attachments[0]?.url ? attachments[0]?.url : null)

    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.error("Log channel is not a text channel or does not exist.");
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
