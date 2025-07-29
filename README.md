# Example compile:

```sh
git clone --recursive git@github.com:JacobLinCool/smart-whisper.git
cd smart-whisper/whisper.cpp
make libwhisper.a -j
```

```sh
pacman -S openblas
```

```sh
BYOL="$HOME/code/external/smart-whisper/whisper.cpp/libwhisper.a -lopenblas" npm i smart-whisper
```

then install normally lol

# File from any format to CORRECT wav for example

```sh
ffmpeg -i input.any -ar 16000 -ac 1 output.wav
```

# Models
https://huggingface.co/ggerganov/whisper.cpp/blob/main/ggml-base.bin

# Run
```sh
npx tsx index.ts <model> ./output.wav
```
