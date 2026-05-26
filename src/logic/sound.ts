type SfxKey = 'move' | 'eat' | 'death' | 'win';

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioCtx = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioCtx) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioCtx();
  }

  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }

  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType, volume: number) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + duration);

  oscillator.onended = () => {
    gain.disconnect();
    oscillator.disconnect();
  };
}

export function playSfx(key: SfxKey) {
  switch (key) {
    case 'move':
      playTone(650, 0.04, 'triangle', 0.01);
      break;
    case 'eat':
      playTone(880, 0.08, 'sine', 0.02);
      break;
    case 'death':
      playTone(180, 0.2, 'sawtooth', 0.025);
      break;
    case 'win':
      playTone(523, 0.12, 'square', 0.018);
      setTimeout(() => playTone(659, 0.12, 'square', 0.018), 80);
      setTimeout(() => playTone(784, 0.18, 'square', 0.018), 160);
      break;
    default:
      break;
  }
}
