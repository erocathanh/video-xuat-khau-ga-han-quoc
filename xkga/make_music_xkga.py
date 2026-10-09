#!/usr/bin/env python3
"""Synthesize a dark, low background bed for the xkga short (0 credits).

Adapted from flowmo-tieng-viet/make_music.py: minor 4-chord loop
(Am9 - Fmaj7 - Dm7 - E7sus4), 84 bpm, low pad one octave down, a sparse
muted pluck on 8ths, a sub drone on the root, soft kick on beat 1 and a
quiet off-beat tick. No UI pops. Output 48 kHz stereo wav, peak-normalised;
build_timeline.py sets the final loudness well under the voice.

usage: make_music_xkga.py <out.wav> --seconds 130.9
"""
import sys, wave
import numpy as np

SR = 48000


def tone(freq, dur, kind='sine'):
    t = np.arange(int(dur * SR)) / SR
    if kind == 'pad':
        w = sum(np.sin(2 * np.pi * freq * m * t + m) / (m * m) for m in (1, 2, 3, 4))
        w += 0.6 * np.sin(2 * np.pi * freq * 1.004 * t)
        w += 0.4 * np.sin(2 * np.pi * freq * 0.997 * t)
        return w
    return np.sin(2 * np.pi * freq * t)


def env(n, a, r):
    e = np.ones(n)
    a, r = min(int(a * SR), n // 2), min(int(r * SR), n // 2)
    if a: e[:a] = np.linspace(0, 1, a)
    if r: e[-r:] *= np.linspace(1, 0, r)
    return e


def lowpass(x, alpha):
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += alpha * (x[i] - acc)
        y[i] = acc
    return y


def main():
    a = sys.argv[1:]
    out = a[0]
    total = float(a[a.index('--seconds') + 1]) if '--seconds' in a else 130.0
    n = int(total * SR)
    mix = np.zeros(n)
    bpm = 84
    beat = 60 / bpm
    bar = beat * 4
    chords = [[220.0, 261.63, 329.63, 493.88],   # Am9 (A C E B)
              [174.61, 220.0, 261.63, 329.63],   # Fmaj7
              [146.83, 174.61, 220.0, 261.63],   # Dm7
              [164.81, 220.0, 246.94, 293.66]]   # E7sus4 (E A B D)
    roots = [55.0, 43.65, 36.71, 41.2]
    t0, k = 0.0, 0
    while t0 < total:
        ch = chords[k % 4]
        seg = int(min(bar, total - t0) * SR)
        s = int(t0 * SR)
        pad = sum(tone(f / 2, seg / SR, 'pad') for f in ch) / len(ch)
        mix[s:s + seg] += 0.20 * pad * env(seg, 0.9, 0.9)
        drone = tone(roots[k % 4], seg / SR) + 0.3 * tone(roots[k % 4] * 2, seg / SR)
        mix[s:s + seg] += 0.16 * drone * env(seg, 0.4, 0.4)
        for i in range(8):
            ts = t0 + i * beat / 2
            if ts >= total: break
            if i in (3, 7): continue  # sparse
            f = ch[[0, 2, 1, 3, 2, 0, 3, 1][i]]
            d = 0.28
            m = int(d * SR); p = int(ts * SR)
            pl = tone(f, d) * np.exp(-np.arange(m) / SR * 14)
            mix[p:p + m] += 0.05 * pl[:len(mix[p:p + m])]
        for b in (0,):
            ts = t0 + b * beat
            if ts >= total: break
            m = int(0.3 * SR); p = int(ts * SR)
            tt = np.arange(m) / SR
            kick = np.sin(2 * np.pi * (90 * np.exp(-tt * 16) + 38) * tt) * np.exp(-tt * 11)
            mix[p:p + m] += 0.26 * kick[:len(mix[p:p + m])]
        rng = np.random.default_rng(k)
        for b in (1.5, 3.5):
            ts = t0 + b * beat
            if ts >= total: break
            m = int(0.05 * SR); p = int(ts * SR)
            tick = rng.standard_normal(m) * np.exp(-np.arange(m) / SR * 90)
            mix[p:p + m] += 0.025 * tick[:len(mix[p:p + m])]
        t0 += bar; k += 1
    mix = lowpass(mix, 0.35)
    mix *= env(n, 2.0, 3.0)
    mix /= np.max(np.abs(mix)) + 1e-9
    mix *= 0.89
    st = np.stack([mix, np.roll(mix, int(0.015 * SR))], axis=1)
    pcm = (st * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(f'{out} · {n / SR:.2f}s')


if __name__ == '__main__':
    main()
