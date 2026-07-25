/**
 * Generates every sound the game uses, from scratch.
 *
 *   node scripts/gen-sounds.js
 *
 * Why generate instead of ship audio files: no licensing questions, no binary
 * blobs of unknown origin in the repo, and the whole palette stays tweakable —
 * change a number here and re-run.
 *
 * Output is 16-bit signed PCM mono WAV with a canonical 44-byte RIFF header.
 * The `data` chunk size is written correctly (streaming placeholders like
 * 0xFFFFFFFF break duration reporting on Android/ExoPlayer).
 *
 * Short SFX are 44100 Hz. The ambient loop is 22050 Hz to keep it ~350 KB
 * instead of ~700 KB — uncompressed audio costs ~86 KB/second at 44.1 kHz mono.
 */

const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "assets", "audio");
const SFX_RATE = 44100;
const PAD_RATE = 22050;

// ---------------------------------------------------------------- WAV writing

function writeWav(filename, samples, sampleRate) {
  const dataBytes = samples.length * 2;
  const buf = Buffer.alloc(44 + dataBytes);

  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(36 + dataBytes, 4); // fileSize - 8
  buf.write("WAVE", 8, "ascii");

  buf.write("fmt ", 12, "ascii");
  buf.writeUInt32LE(16, 16); // PCM fmt chunk size
  buf.writeUInt16LE(1, 20); // audioFormat = PCM
  buf.writeUInt16LE(1, 22); // numChannels = mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28); // byteRate = rate * channels * 2
  buf.writeUInt16LE(2, 32); // blockAlign = channels * 2
  buf.writeUInt16LE(16, 34); // bitsPerSample

  buf.write("data", 36, "ascii");
  buf.writeUInt32LE(dataBytes, 40);

  for (let i = 0; i < samples.length; i++) {
    // Soft-clip rather than wrap, so an over-hot mix distorts gracefully.
    let v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }

  const out = path.join(OUT_DIR, filename);
  fs.writeFileSync(out, buf);
  const kb = (buf.length / 1024).toFixed(0);
  const ms = ((samples.length / sampleRate) * 1000).toFixed(0);
  console.log(`  ${filename.padEnd(16)} ${String(ms).padStart(5)} ms  ${String(kb).padStart(4)} KB  @${sampleRate}`);
}

// ------------------------------------------------------------------ synthesis

/** Exponential decay envelope, 1 -> ~0 over `tau` seconds. */
const decay = (t, tau) => Math.exp(-t / tau);

/** Short raised-cosine ramps at both ends; kills the click of a hard edge. */
function applyEdgeFades(samples, rate, fadeMs = 4) {
  const n = Math.min(Math.floor((fadeMs / 1000) * rate), Math.floor(samples.length / 2));
  for (let i = 0; i < n; i++) {
    const w = 0.5 - 0.5 * Math.cos((Math.PI * i) / n);
    samples[i] *= w;
    samples[samples.length - 1 - i] *= w;
  }
  return samples;
}

/**
 * Additive sine tone with a percussive envelope. `partials` are [ratio, gain]
 * pairs relative to the fundamental.
 */
function tone({ freq, dur, rate = SFX_RATE, tau = dur / 3, gain = 0.5, partials = [[1, 1]], sweep = 0, attackMs = 2 }) {
  const n = Math.floor(dur * rate);
  const out = new Float64Array(n);
  const attack = Math.max(1, Math.floor((attackMs / 1000) * rate));

  for (let i = 0; i < n; i++) {
    const t = i / rate;
    // Linear pitch sweep expressed in semitones over the whole duration.
    const f = freq * Math.pow(2, (sweep * (t / dur)) / 12);
    let v = 0;
    for (const [ratio, amp] of partials) {
      v += amp * Math.sin(2 * Math.PI * f * ratio * t);
    }
    const env = decay(t, tau) * (i < attack ? i / attack : 1);
    out[i] = v * env * gain;
  }
  return out;
}

/** Mixes buffers at optional sample offsets into one buffer. */
function mix(parts) {
  const len = Math.max(...parts.map((p) => p.offset + p.buf.length));
  const out = new Float64Array(len);
  for (const { buf, offset, gain = 1 } of parts) {
    for (let i = 0; i < buf.length; i++) out[offset + i] += buf[i] * gain;
  }
  return out;
}

const at = (sec, rate = SFX_RATE) => Math.floor(sec * rate);

/** A sequence of tones, each starting `step` seconds after the previous. */
function arpeggio(freqs, step, opts) {
  return mix(freqs.map((freq, i) => ({ buf: tone({ freq, ...opts }), offset: at(i * step) })));
}

// Equal-temperament helper: MIDI note number -> Hz.
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const N = { C4: hz(60), D4: hz(62), E4: hz(64), G4: hz(67), A4: hz(69), B4: hz(71), C5: hz(72), E5: hz(76), G5: hz(79), A5: hz(81), A2: hz(45), C3: hz(48), E3: hz(52) };

// ------------------------------------------------------------- the loop (pad)

/**
 * Seamless ambient pad.
 *
 * The trick for a gapless loop: every partial and every LFO must complete a
 * WHOLE number of cycles across the file, so the last sample joins the first
 * with no discontinuity. That means quantising each frequency to a multiple of
 * 1/duration Hz. No fades are applied — a fade would create the very seam we
 * are avoiding. Noise is deliberately excluded since it cannot loop cleanly.
 */
function ambientPad(dur = 8, rate = PAD_RATE) {
  const n = Math.floor(dur * rate);
  const out = new Float64Array(n);
  const quantum = 1 / dur;
  const q = (f) => Math.round(f / quantum) * quantum;

  // A minor 9 spread over three octaves — calm, slightly mysterious.
  const voices = [
    { f: q(N.A2), gain: 0.5, lfo: q(0.125), lfoDepth: 0.25 },
    { f: q(N.E3), gain: 0.28, lfo: q(0.25), lfoDepth: 0.3 },
    { f: q(N.C4), gain: 0.2, lfo: q(0.375), lfoDepth: 0.35 },
    { f: q(N.E4), gain: 0.14, lfo: q(0.25), lfoDepth: 0.4 },
    { f: q(N.B4), gain: 0.08, lfo: q(0.5), lfoDepth: 0.5 },
    // Slightly detuned doubles give it width without stereo.
    { f: q(N.A2 * 1.004), gain: 0.22, lfo: q(0.125), lfoDepth: 0.3 },
    { f: q(N.E3 * 0.997), gain: 0.14, lfo: q(0.375), lfoDepth: 0.3 },
  ];

  for (let i = 0; i < n; i++) {
    const t = i / rate;
    let v = 0;
    for (const vo of voices) {
      const lfo = 1 - vo.lfoDepth + vo.lfoDepth * (0.5 + 0.5 * Math.sin(2 * Math.PI * vo.lfo * t));
      // A touch of 2nd harmonic keeps it from sounding like a test tone.
      v += vo.gain * lfo * (Math.sin(2 * Math.PI * vo.f * t) + 0.18 * Math.sin(2 * Math.PI * vo.f * 2 * t));
    }
    out[i] = v * 0.16;
  }
  return out;
}

// ------------------------------------------------------------------- the bank

function build() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log("Generating audio into assets/audio/");

  // A soft, short UI click. Two quick partials, very fast decay.
  writeWav(
    "tap.wav",
    applyEdgeFades(
      tone({ freq: 660, dur: 0.07, tau: 0.02, gain: 0.32, partials: [[1, 1], [2.5, 0.3], [4, 0.12]] }),
      SFX_RATE
    ),
    SFX_RATE
  );

  // Selecting a category: a small upward blip.
  writeWav(
    "select.wav",
    applyEdgeFades(
      tone({ freq: 620, dur: 0.11, tau: 0.045, gain: 0.3, sweep: 5, partials: [[1, 1], [2, 0.35]] }),
      SFX_RATE
    ),
    SFX_RATE
  );

  // Deselect / go back: the same shape, falling.
  writeWav(
    "back.wav",
    applyEdgeFades(
      tone({ freq: 560, dur: 0.12, tau: 0.05, gain: 0.28, sweep: -5, partials: [[1, 1], [2, 0.25]] }),
      SFX_RATE
    ),
    SFX_RATE
  );

  // Advancing a screen: bright major triad.
  writeWav(
    "confirm.wav",
    applyEdgeFades(
      arpeggio([N.C5, N.E5, N.G5], 0.055, { dur: 0.3, tau: 0.1, gain: 0.2, partials: [[1, 1], [2, 0.22]] }),
      SFX_RATE
    ),
    SFX_RATE
  );

  // Revealing the secret word: gentle shimmer up.
  writeWav(
    "reveal.wav",
    applyEdgeFades(
      arpeggio([N.G4, N.C5, N.E5, N.G5], 0.06, { dur: 0.45, tau: 0.17, gain: 0.16, partials: [[1, 1], [2, 0.3], [3, 0.1]] }),
      SFX_RATE
    ),
    SFX_RATE
  );

  // There is deliberately NO imposter-specific sting. The reveal step plays the
  // same effect for everyone — a distinct sound would tell the whole room who
  // the imposter is, which is exactly what the game must hide.

  // End of round, once the imposter is public: a happy little run.
  writeWav(
    "win.wav",
    applyEdgeFades(
      arpeggio([N.C5, N.E5, N.G5, hz(84)], 0.075, { dur: 0.55, tau: 0.2, gain: 0.17, partials: [[1, 1], [2, 0.25], [3, 0.08]] }),
      SFX_RATE
    ),
    SFX_RATE
  );

  // Home screen ambience. No fades: it must loop seamlessly.
  writeWav("home_loop.wav", ambientPad(8, PAD_RATE), PAD_RATE);

  console.log("Done.");
}

build();
