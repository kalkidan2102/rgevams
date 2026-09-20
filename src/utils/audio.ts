/**
 * Professional Synthesized Geological Alert Audio Engine
 * Uses the native Web Audio API to construct high-fidelity sonar/ping indicators
 * without requiring external .mp3/.wav assets.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  // Reuse existing or create new AudioContext
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass();
      } catch {
        return null;
      }
    }
  }

  // Resume context if suspended (browser security policies)
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

export function playGeologicalAlertSound(severity: "Red" | "Orange") {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Create master gain control for overall volume smoothing
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.35, now + 0.05); // quick fade in to prevent clicks

    if (severity === "Red") {
      // RED ALERT: High-urgency dual-pulse alert (two-frequency sonar ping)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 1.2);

      // Distribute frequencies (Perfect fifth interval to sound harmonic but urgent)
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(392.0, now + 0.8); // G4

      osc2.type = "triangle"; // softer harmonic
      osc2.frequency.setValueAtTime(880.0, now); // A5
      osc2.frequency.exponentialRampToValueAtTime(587.33, now + 0.8); // D5

      // Sub-harmonic oscillator for grounding/depth
      const subOsc = ctx.createOscillator();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(110.0, now); // A2

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.12, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      // Volume envelope with two pulses
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.4, now + 0.04);
      masterGain.gain.exponentialRampToValueAtTime(0.15, now + 0.35);

      // Second pulse trigger
      masterGain.gain.setValueAtTime(0.15, now + 0.36);
      masterGain.gain.linearRampToValueAtTime(0.5, now + 0.4);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      // Connect nodes
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);

      masterGain.connect(ctx.destination);

      // Start & Stop
      osc1.start(now);
      osc2.start(now);
      subOsc.start(now);

      osc1.stop(now + 1.5);
      osc2.stop(now + 1.5);
      subOsc.stop(now + 1.5);
    } else {
      // ORANGE ALERT: Professional single-pulse warm attention indicator
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440.0, now); // A4 (Standard tone)
      osc.frequency.exponentialRampToValueAtTime(220.0, now + 0.9); // Pitch decay

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, now);

      // Volume envelope with long warm tail
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.35, now + 0.08);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      osc.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    }
  } catch {
    // Silent fail if AudioContext is not permitted yet
  }
}
