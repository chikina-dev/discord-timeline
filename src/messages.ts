import { Client, EmbedBuilder, TextChannel, Message } from "discord.js";
import type { ThreadsType } from "./types";
import { logMessage } from "./utils";

export async function handleMessageCreate(
  client: Client,
  logChannel: TextChannel,
  threads: ThreadsType[],
  message: Message
) {
  const thread = threads.find(t => t.id === message.channelId);
  if (!thread) return;

  const content = message.content || null;
  const attachments = [...message.attachments.values()];
  logMessage(content);

  const embed = buildMessageEmbed(message, thread, content, attachments);
  const embeds = message.embeds;
  const allEmbeds = [embed, ...embeds];

  const sentMessage = await logChannel.send({ embeds: allEmbeds });

  const hasUrl = (content?.match(/https?:\/\/\S+/g)?.length ?? 0) > 0;
  if (hasUrl) {
    await handleUrlEmbeds(client, message, embeds, allEmbeds, sentMessage);
  }
}

function buildMessageEmbed(
  message: Message,
  thread: ThreadsType,
  content: string | null,
  attachments: { url?: string }[]
): EmbedBuilder {
  const username = message.member?.displayName || message.author.displayName || message.author.username;

  return new EmbedBuilder()
    .setAuthor({
      name: username,
      iconURL: message.author.displayAvatarURL()
    })
    .setTitle(thread.name)
    .setDescription(content)
    .setColor("Grey")
    .setURL(`https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`)
    .setTimestamp(message.createdAt)
    .setImage(attachments[0]?.url ?? null);
}

async function handleUrlEmbeds(
  client: Client,
  message: Message,
  originalEmbeds: Message["embeds"],
  allEmbeds: (EmbedBuilder | typeof originalEmbeds[number])[],
  sentMessage: Message
) {
  setTimeout(async () => {
    const target = client.channels.cache.get(message.channelId) as TextChannel;
    const fetchedMessage = await target.messages.fetch(message.id);
    const newEmbeds = fetchedMessage.embeds;
    const additionalEmbeds = newEmbeds.filter(e => !originalEmbeds.find(em => em.url === e.url));

    if (additionalEmbeds.length > 0) {
      await sentMessage.edit({ embeds: [...allEmbeds, ...additionalEmbeds] });
    }
  }, 1000);
}
