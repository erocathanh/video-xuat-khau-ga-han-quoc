#!/usr/bin/env python3
"""Build the xkga timeline + mixed audio for the XkgaVi composition. Re-runnable.

Reads  xkga/tts/rows.json (12 script rows), xkga/tts/trim-NN.wav (narration),
       xkga/omni/*.mp4 (presenter clips with audio + silent b-roll).
Writes xkga/timeline.json          row -> start, duration, visual (+ frame values)
       public/xkga/voice-mix.wav   narration (atempo 1.07) at row starts + presenter
                                   clip audio at their rows, loudnorm -16 LUFS
       public/xkga/music-bed.wav   dark synth bed (make_music_xkga.py), set ~-34 LUFS
       public/xkga/media/*.mp4     copies of the Omni clips the composition plays
       src/xkga/timeline.ts        the same timeline as a TS module for XkgaVi

Row duration = narration length / 1.07 + 0.4 s gap; presenter rows = clip length.
Durations are rounded to whole frames and start frames are cumulative, so audio
and video share exactly the same grid.

usage: python3 xkga/build_timeline.py
"""
import json, os, re, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
X = os.path.join(ROOT, 'xkga')
BUILD = os.path.join(X, 'build')
PUB = os.path.join(ROOT, 'public', 'xkga')
MEDIA = os.path.join(PUB, 'media')
FPS = 30
TEMPO = 1.07
GAP = 0.4
SR = 48000
VOICE_LUFS = -16.0
MUSIC_LUFS = -34.0

PRESENTER = {7: 'thanh-clip-1.mp4', 11: 'thanh-clip-2-1-A.mp4', 12: 'thanh-clip-2-2-A.mp4'}
VISUAL = {
    1: 'mapIntro',
    2: 'omni:le-1-san-khau.mp4,le-2-cat-bang.mp4',
    3: 'omni:nha-may-1-day-chuyen.mp4,nha-may-2-cong-nhan.mp4',
    4: 'info:agencies',
    5: 'info:grid',
    6: 'info:heat',
    7: 'presenter:thanh-clip-1.mp4',
    8: 'omni:cang-1-tren-cao.mp4,cang-2-container-lanh.mp4',
    9: 'mapMarkets',
    10: 'omni:cang-2-container-lanh.mp4,le-2-cat-bang.mp4',
    11: 'presenter:thanh-clip-2-1-A.mp4',
    12: 'presenter:thanh-clip-2-2-A.mp4',
}


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stderr[-2000:])
        raise SystemExit(f'failed: {" ".join(cmd[:6])} ...')
    return r


def duration(path):
    r = run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path])
    return float(r.stdout.strip())


def loudness(path):
    """Integrated loudness (LUFS) via ffmpeg ebur128."""
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128', '-f', 'null', '-'],
                       capture_output=True, text=True)
    m = re.findall(r'I:\s+(-?[0-9.]+) LUFS', r.stderr)
    return float(m[-1])


def to_wav(src, dst, extra_af=None):
    af = ['aresample=48000', 'aformat=sample_fmts=s16:channel_layouts=stereo']
    if extra_af:
        af = [extra_af] + af
    run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vn', '-af', ','.join(af), dst])


def gain_to(src, dst, target):
    g = target - loudness(src)
    run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', f'volume={g:.2f}dB', dst])


def main():
    os.makedirs(BUILD, exist_ok=True)
    os.makedirs(MEDIA, exist_ok=True)
    rows = json.load(open(os.path.join(X, 'tts', 'rows.json')))

    pieces = []  # (row, wav path)
    timeline = []
    start_f = 0
    for r in rows:
        n = int(r[0])
        if n in PRESENTER:
            clip = os.path.join(X, 'omni', PRESENTER[n])
            raw = os.path.join(BUILD, f'pres-{n:02d}.wav')
            to_wav(clip, raw)
            dur = duration(clip)
        else:
            src = os.path.join(X, 'tts', f'trim-{n:02d}.wav')
            raw = os.path.join(BUILD, f'nar-{n:02d}.wav')
            to_wav(src, raw, f'atempo={TEMPO}')
            dur = duration(raw) + GAP
        lev = os.path.join(BUILD, f'lev-{n:02d}.wav')
        gain_to(raw, lev, VOICE_LUFS)
        dur_f = round(dur * FPS)
        timeline.append({
            'row': n,
            'start': round(start_f / FPS, 3),
            'duration': round(dur_f / FPS, 3),
            'startFrame': start_f,
            'durationFrames': dur_f,
            'visual': VISUAL[n],
            'kind': r[4],
        })
        pieces.append((n, lev, start_f))
        start_f += dur_f

    total_f = start_f
    total_s = total_f / FPS

    # Mix: each piece delayed to its row start; amix without normalisation.
    inputs, filt = [], []
    for i, (_, path, sf) in enumerate(pieces):
        inputs += ['-i', path]
        ms = round(sf / FPS * 1000)
        filt.append(f'[{i}:a]adelay={ms}|{ms}[d{i}]')
    filt.append(''.join(f'[d{i}]' for i in range(len(pieces))) +
                f'amix=inputs={len(pieces)}:normalize=0:dropout_transition=0,'
                f'apad=whole_dur={total_s:.3f},atrim=0:{total_s:.3f}[m]')
    premix = os.path.join(BUILD, 'premix.wav')
    run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filt), '-map', '[m]',
         '-ar', str(SR), '-ac', '2', premix])

    # Two-pass linear loudnorm to -16 LUFS on the mix.
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', premix, '-af',
                        f'loudnorm=I={VOICE_LUFS}:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True)
    js = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
    ln = (f'loudnorm=I={VOICE_LUFS}:TP=-1.5:LRA=11:measured_I={js["input_i"]}:measured_TP={js["input_tp"]}:'
          f'measured_LRA={js["input_lra"]}:measured_thresh={js["input_thresh"]}:offset={js["target_offset"]}:linear=true')
    voice = os.path.join(PUB, 'voice-mix.wav')
    run(['ffmpeg', '-v', 'error', '-y', '-i', premix, '-af', ln + ',aresample=48000', '-ar', str(SR),
         '-c:a', 'pcm_s16le', voice])

    # Music bed.
    raw_music = os.path.join(BUILD, 'music-raw.wav')
    run([sys.executable, os.path.join(X, 'make_music_xkga.py'), raw_music, '--seconds', f'{total_s:.3f}'])
    gain_to(raw_music, os.path.join(PUB, 'music-bed.wav'), MUSIC_LUFS)

    # Media copies for staticFile().
    used = set()
    for v in VISUAL.values():
        if v.split(':', 1)[0] in ('omni', 'presenter'):
            used.update(v.split(':', 1)[1].split(','))
    for name in sorted(used):
        src, dst = os.path.join(X, 'omni', name), os.path.join(MEDIA, name)
        if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src):
            shutil.copy2(src, dst)

    out = {'fps': FPS, 'totalFrames': total_f, 'totalSeconds': round(total_s, 3), 'tempo': TEMPO, 'gap': GAP,
           'rows': timeline}
    with open(os.path.join(X, 'timeline.json'), 'w') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    # Same data as a TS module (tsconfig has no resolveJsonModule).
    with open(os.path.join(ROOT, 'src', 'xkga', 'timeline.ts'), 'w') as f:
        f.write('// Generated by xkga/build_timeline.py — do not edit; re-run the script.\n')
        f.write('export type XkgaRow = { row: number; start: number; duration: number; startFrame: number; '
                'durationFrames: number; visual: string; kind: string };\n')
        f.write('export const TIMELINE: { fps: number; totalFrames: number; totalSeconds: number; rows: XkgaRow[] } = ')
        f.write(json.dumps({k: out[k] for k in ('fps', 'totalFrames', 'totalSeconds', 'rows')}, ensure_ascii=False, indent=1))
        f.write(';\n')

    print(f'total {total_s:.2f}s ({total_f} f) · voice {loudness(voice):.1f} LUFS · '
          f'music {loudness(os.path.join(PUB, "music-bed.wav")):.1f} LUFS')
    for t in timeline:
        print(f"  row {t['row']:>2}  start {t['start']:7.2f}s  dur {t['duration']:6.2f}s  {t['visual']}")


if __name__ == '__main__':
    main()
