import { Client, Events, GatewayIntentBits } from "discord.js";
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import "dotenv/config";
import axios from "axios";

const AUDIO_DIRECTORY = "audios";

async function download_file(url: string, fileName: string) {
    const res = await axios.get(url, {responseType: "stream"});
    const stream = createWriteStream(fileName);

    res.data.pipe(stream);
};

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
] });

client.once(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) {
        return;
    }

    let attachment = message.attachments.first();

    if (!attachment || attachment.contentType !== "audio/ogg") {
        return;
    }

    if (!existsSync(AUDIO_DIRECTORY)) {
        mkdirSync(AUDIO_DIRECTORY);
    }

    try {
        download_file(attachment.url, `${AUDIO_DIRECTORY}/test.ogg`);
    } catch (err) {
        console.error(`Couldn't download file: ${err}`);
    }


});

client.login(process.env.TOKEN);
