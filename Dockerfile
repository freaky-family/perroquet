FROM node:22.17-bullseye
WORKDIR /app

RUN git clone --recursive https://github.com/JacobLinCool/smart-whisper.git && \
    cd smart-whisper/whisper.cpp && \
    make libwhisper.a

RUN apt-get update && apt-get install -y --no-install-recommends libopenblas-dev ffmpeg && rm -rf /var/lib/apt/lists/*

RUN cd /app && BYOL="/app/smart-whisper/whisper.cpp/libwhisper.a -lopenblas" npm install smart-whisper

WORKDIR /app/perroquet
COPY ./ ./

RUN npm install

CMD ["npm", "run", "start"]
