// A quiet, locally synthesized accompaniment. Created only after a user gesture.
export function createAmbientAudio(onChange) {
  let context,
    master,
    timer,
    nextBar = 0,
    bar = 0;
  const chords = [
    [48, 55, 59, 64],
    [45, 52, 55, 60],
    [41, 48, 52, 57],
    [43, 50, 53, 57],
  ];
  const beat = 60 / 72;
  function note(midi, at, duration, level) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(level, at + 0.06);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(envelope).connect(master);
    oscillator.start(at);
    oscillator.stop(at + duration + 0.02);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
  }
  function schedule() {
    if (context.state !== "running") return;
    if (nextBar < context.currentTime) nextBar = context.currentTime + 0.05;
    while (nextBar < context.currentTime + 0.6) {
      const chord = chords[bar++ % chords.length];
      chord.forEach((pitch, i) =>
        note(pitch, nextBar + i * 0.025, beat * 4.5, 0.075),
      );
      [0, 2, 1, 3].forEach((i, step) =>
        note(chord[i] + 12, nextBar + step * beat, beat * 1.8, 0.05),
      );
      nextBar += beat * 4;
    }
  }
  return {
    async toggle() {
      if (!context) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) throw new Error("Web Audio unavailable");
        context = new Audio();
        master = context.createGain();
        master.gain.value = 0.5;
        master.connect(context.destination);
        context.onstatechange = () => onChange(context.state === "running");
      } else if (context.state === "running") {
        await context.suspend();
        clearInterval(timer);
        onChange(false);
        return;
      }
      await context.resume();
      schedule();
      clearInterval(timer);
      timer = window.setInterval(schedule, 250);
      onChange(context.state === "running");
    },
    dispose() {
      clearInterval(timer);
      context?.close();
    },
  };
}
