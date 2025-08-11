import {
    ActivityType,
    Client,
    Events,
    GatewayIntentBits,
    Message,
    MessageSnapshot,
    Partials,
    ThreadAutoArchiveDuration,
} from "discord.js";
import { createWriteStream, existsSync, mkdirSync, rmSync } from "node:fs";
import "dotenv/config";
import axios from "axios";
import PerroquetAudio, { transform_ogg_wav } from "./audio";
import winston from "winston";

const AUDIO_DIRECTORY = "audios";
const CREATE_THREAD = process.env.THREAD === "true" ? true : false;

async function download_file(url: string, fileName: string) {
    try {
        const res = await axios.get(url, { responseType: "stream" });
        const stream = createWriteStream(fileName);

        res.data.pipe(stream);
        return new Promise((resolve, reject) => {
            stream.on("finish", () => resolve(fileName));
            stream.on("error", () => reject("Couldn't write file"));
        });
    } catch (err) {
        throw err;
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel, Partials.Message],
});

client.once(Events.ClientReady, (readyClient) => {
    if (existsSync(AUDIO_DIRECTORY)) {
        rmSync(AUDIO_DIRECTORY, { recursive: true, force: true });
        winston.debug(`Deleted ${AUDIO_DIRECTORY}`);
    }
    client.user?.setActivity("voice messages", {
        type: ActivityType.Listening,
    });
    winston.info(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) {
        return;
    }

    let attachment_message: Message | MessageSnapshot = message;

    if (message.reference && message.messageSnapshots) {
        let reference = message.messageSnapshots.first();
        if (reference) {
            attachment_message = reference;
        }
    }

    let attachment = attachment_message.attachments.first();

    if (!attachment || attachment.contentType !== "audio/ogg") {
        return;
    }

    if (!existsSync(AUDIO_DIRECTORY)) {
        winston.debug(`${AUDIO_DIRECTORY} created`);
        mkdirSync(AUDIO_DIRECTORY);
    }

    let fileName = `${AUDIO_DIRECTORY}/${Date.now()}.ogg`;

    winston.info(`Found new voice message`);

    try {
        await download_file(attachment.url, fileName);
        winston.debug(`Downloaded file ${fileName}`);
    } catch (err) {
        winston.error(`Couldn't download file: ${err}`);
    }

    try {
        fileName = transform_ogg_wav(fileName);
        const audio = new PerroquetAudio(fileName);
        audio.read();

        let transcription = await audio.transcribe();
        winston.info(`Finished transcribing`);
        audio.whisper.free();

        let full_text = "";
        transcription.forEach((part) => {
            full_text += part.text;
        });

        if (CREATE_THREAD) {
            let thread = await message.startThread({
                name: "Transcription",
                autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
            });
            thread.send({
                allowedMentions: { repliedUser: false },
                content: full_text,
            });
        } else {
            message.reply({
                allowedMentions: { repliedUser: false },
                content: full_text,
            });
        }
    } catch (err) {
        winston.error(`Couldn't transcribe file: ${err}`);
    }
});

client.login(process.env.TOKEN);
