const volume = document.getElementById("volume");
const bass = document.getElementById("bass");
const mid = document.getElementById("mid");
const treble = document.getElementById("treble");
const visualiser = document.getElementById("visualiser");

// create an audio context
setupEventListeners();
const context = new window.AudioContext();

const audioElement = document.querySelector("audio");

const mediaElement = context.createMediaElementSource(audioElement);

const analyserNode = new AnalyserNode(context, { fftSize: 128 });
const gainNode = new GainNode(context, { gain: volume.value });

//grabbing th audio

const bassEQ = new BiquadFilterNode(context, {
  type: "lowshelf",
  frequency: 500,
  gain: bass.value,
});
const midEQ = new BiquadFilterNode(context, {
  type: "peaking",
  Q: Math.SQRT1_2,
  frequency: 1500,
  gain: mid.value,
});
const trebleEQ = new BiquadFilterNode(context, {
  type: "highshelf",
  frequency: 3000,
  gain: treble.value,
});

setupContext();
resize();
drawVisualiser();

//creating event listening for adjustments
function setupEventListeners() {
  window.addEventListener("resize", resize);

  volume.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    gainNode.gain.value = value; //has a pop on quick volume change the fix =>
    gainNode.gain.setTargetAtTime(value, context.currentTime, 0.01);
  });
  bass.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    bassEQ.gain.setTargetAtTime(value, context.currentTime, 0.01);
  });
  mid.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    midEQ.gain.setTargetAtTime(value, context.currentTime, 0.01);
  });
  treble.addEventListener("input", (e) => {
    const value = parseFloat(e.target.value);
    trebleEQ.gain.setTargetAtTime(value, context.currentTime, 0.01);
  });
}

//function for intergrating our imported audio
async function setupContext() {
  const guitar = await getGuitar(); //this brings our audio but we give it a context below
  if (context.state === "suspended") {
    await context.resume;
  }
  const source = mediaElement;
  source
    .connect(bassEQ)
    .connect(midEQ)
    .connect(trebleEQ)
    .connect(gainNode)
    .connect(analyserNode)
    .connect(context.destination);
}

//function for bringing in the audio
function getGuitar() {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      autoGainControl: false,
      noiseSuppression: false,
      latency: 0,
    },
  });
}
function drawVisualiser() {
  requestAnimationFrame(drawVisualiser);

  const bufferLength = analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyserNode.getByteFrequencyData(dataArray);

  const width = visualiser.width;
  const height = visualiser.height;
  const barWidth = width / bufferLength;
  const canvasContext = visualiser.getContext("2d");
  canvasContext.clearRect(0, 0, width, height);

  dataArray.forEach((item, index) => {
    const y = ((item / 255) * height) / 2;
    const x = barWidth * index;

    canvasContext.fillStyle = `hsl(${(y / height) * 400}, 100%, 50%)`;
    canvasContext.fillRect(x, height - y, barWidth, y);
  });
}

function resize() {
  visualiser.width = visualiser.clientWidth * window.devicePixelRatio;
  visualiser.height = visualiser.clientHeight * window.devicePixelRatio;
}
