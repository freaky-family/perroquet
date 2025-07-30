import { Client, Events, GatewayIntentBits } from "discord.js";
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import "dotenv/config";
import axios from "axios";

const AUDIO_DIRECTORY = "audios";

async function download_file(url: string, fileName: string) {
    try {
        const res = await axios.get(url, {responseType: "stream"});
        const stream = createWriteStream(fileName);

        res.data.pipe(stream);
        return new Promise((resolve, reject) => {
            stream.on("finish", () => resolve(fileName));
            stream.on("error", () => reject("Couldn't write file"));
        });
    } catch (err) {
        throw err;
    }
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

    let fileName = `${AUDIO_DIRECTORY}/${Date.now()}.ogg`;

    try {
        await download_file(attachment.url, fileName);
    } catch (err) {
        console.error(`Couldn't download file: ${err}`);
    }


});

client.login(process.env.TOKEN);
