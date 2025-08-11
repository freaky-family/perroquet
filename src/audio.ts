import { Whisper } from "smart-whisper";
import { decode } from "node-wav";
import fs from "node:fs";
import { execSync } from "node:child_process";
import winston from "winston";

const SAMPLE_RATE = 16000;
const CHANNEL_DATA_SIZE = 1;

class Audio {
    name: string;
    whisper: Whisper;
    options: any;

    channel_data: Float32Array | null;
    constructor(name: string, whisper?: Whisper, options: any = {}) {
        this.name = name;

        if (!whisper) {
            if (!process.env.MODEL_PATH) {
                throw new Error("Couldn't find env `MODEL_PATH`");
            }
            let whisper_options = {
                gpu: process.env.DISABLE_GPU === "true" ? false : true,
            };
            this.whisper = new Whisper(process.env.MODEL_PATH, whisper_options);
        } else {
            this.whisper = whisper;
        }

        this.options = options;
        if (process.env.LANGUAGE) {
            options["language"] = process.env.LANGUAGE;
        }

        this.channel_data = null;
    }

    read() {
        winston.info(`Reading audio file and getting channel data`);
        const { sampleRate, channelData } = decode(fs.readFileSync(this.name));

        if (sampleRate !== SAMPLE_RATE) {
            throw new Error(`Invalid sample rate: ${sampleRate}`);
        }
        if (channelData.length !== CHANNEL_DATA_SIZE) {
            throw new Error(`Invalid channel count: ${channelData.length}`);
        }

        this.channel_data = channelData[0];
        return this.channel_data;
    }

    async transcribe() {
        winston.info(`Starting to transcribe using whisper`);
        if (!this.channel_data) {
            throw new Error(`No channel_data, try reading the file before`);
        }

        const task = await this.whisper.transcribe(
            this.channel_data,
            this.options
        );
        return await task.result;
    }
}

export function transform_ogg_wav(fileName: string) {
    let newFileName = fileName.replace(".ogg", ".wav");
    winston.debug(`Transforming file ${fileName} into ${newFileName}`);
    execSync(`ffmpeg -i ${fileName} -ar 16000 -ac 1 ${newFileName}`);
    return newFileName;
}

export default Audio;
