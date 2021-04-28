const ctx = new (window.AudioContext || window.wekitAudioContext)(); //set for grabbing audio from html

const audioElement = document.querySelector("audio");

const mediaElement = ctx.createMediaElementSource(audioElement);

const filter = ctx.createBiquadFilter();

filter.frequency.value = 250;

mediaElement.connect(filter);
filter.connect(ctx.destination);
