import { Whisper } from "smart-whisper";
import Audio from "./audio";

(async () => {
	const model = process.argv[2];
	const wav = process.argv[3];

	const whisper = new Whisper(model, { gpu: true });
	const audio = new Audio(wav, whisper);

	audio.read();
	const test = await audio.transcribe();
	console.log(JSON.stringify(test));

	await whisper.free();
})();
