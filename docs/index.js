console.log('hello world');
import Synth from './Synth.js';
import { parseTab } from './tab.js';
const AudioContext = window.AudioContext || window.webkitAudioContext;

const sampleRate = 44100;
const hz = 440;
const duration = 10;

const bufferSize = sampleRate * duration;

const audioCtx = new AudioContext({sampleRate});
const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);

let data = buffer.getChannelData(0);
for (let i = 0; i <= bufferSize; i++) {
  data[i] = Math.sin(2 * Math.PI * i * hz / sampleRate);
}

let sound = audioCtx.createBufferSource();
sound.buffer = buffer;

sound.connect(audioCtx.destination);

const noise = createNoise();

function play440() {
  sound.start();
}

function playNoise() {
  noise.start();
}

function createNoise() {
  const noiseLength = 5;

  const bufferSize = audioCtx.sampleRate * noiseLength;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);

  let data = buffer.getChannelData(0);

  // fill the buffer with noise
  for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
  }

  let noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  noise.connect(audioCtx.destination);

  return noise;
}

function playWithHarmonics() {
  console.log('playWithHarmonics');
  const tab = parseTab();
  console.log('tab: ', tab);

  const noteDuration = 2;
  const notesNum = 4;
  const totalDuration = 8;
  const bufferLength = sampleRate * totalDuration;

  const audioBuffer = audioCtx.createBuffer(1, bufferLength, sampleRate);

  const synth = new Synth();

  const stringBuffers = [];

  const buffer = new Float32Array(bufferLength);

  tab.forEach((string, stringNum)  => {
    const stringBuffer = new Float32Array(bufferLength);
    let i = 0;
    string.forEach((note) => {
      const noteBuffer = synth.note(parseInt(note), noteDuration);
      for (let j = 0; j < noteBuffer.length; j++) {
        buffer[i + j] = (buffer[i + j] + noteBuffer[j]) / 2;
        i++;
      }
    });
  });

  audioBuffer.copyToChannel(buffer, 0);

  const source = audioCtx.createBufferSource();
  source.connect(audioCtx.destination)
  source.buffer = audioBuffer;

  source.start();
}

document.querySelector('[data-action="play440"').addEventListener('click', play440);
document.querySelector('[data-action="playNoise"').addEventListener('click', playNoise);
document.querySelector('[data-action="playWithHarmonics"').addEventListener('click', playWithHarmonics);
