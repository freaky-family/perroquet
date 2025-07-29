import { Whisper } from "smart-whisper";
import { decode } from "node-wav";
import fs from "node:fs";

const SAMPLE_RATE = 16000;
const CHANNEL_DATA_SIZE = 1;

class Audio {
	name: string;
    whisper: Whisper;
	options: any;

	channel_data: Float32Array | null;
	constructor(name: string, whisper: Whisper, options: any = {}) {
		this.name = name;
        this.whisper = whisper;
		this.options = options;

		this.channel_data = null;
	}

	read() {
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
		if (!this.channel_data) {
			throw new Error(`No channel_data, try reading the file before`);
		}

		const task = await this.whisper.transcribe(this.channel_data, this.options);
		return await task.result;
	}
}

export default Audio;
