# Perroquet

Discord voice message transcription bot using OpenAI's Whisper models

## Installation / Usage

Clone this repo

Create a `models` directory at the root and download a binary from [here](https://huggingface.co/ggerganov/whisper.cpp/tree/main).

Copy the `.env.example` into `.env` and fill it with your info.

### Docker (recommended)

```sh
docker build -t perroquet .
docker run -v ./.env:/app/perroquet/.env -v ./models/:/app/perroquet/models perroquet
```

### From source

Clone the `smart-whisper` repository and compile `libwhisper.a`:
```sh
git clone --recursive https://github.com/JacobLinCool/smart-whisper.git
cd smart-whisper/whisper.cpp
make libwhisper.a -j
```

Then download the `openblas` library:
```sh
# Debian / Ubuntu
sudo apt-get install libopenblas-dev

# Arch Linux
pacman -S openblas

# Search it yourself for other distros
```

Then install manually the `smart-whisper` module:
```sh
BYOL="$PWD/smart-whisper/whisper.cpp/libwhisper.a -lopenblas" npm install smart-whisper
```

And install the rest of the modules:
```sh
npm install
```
