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
