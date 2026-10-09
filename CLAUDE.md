# CLAUDE.md — repo video-xuat-khau-ga-han-quoc

Remotion 4 project for one vertical video (1080x1920, 30 fps, 130.2 s). Composition id `XkgaVi`.

## Rebuild
- First time: `./install.sh` (add `--skip-brew` if node>=18/ffmpeg/python3 already exist). No API keys needed.
- Full render: `npm run render` → `out/xuat-khau-ga-han-quoc.mp4`. Quick check: `--scale=0.25`.
- One frame: `npx remotion still src/index.ts XkgaVi out/f.png --frame=<n>`; read the PNG to verify.
- Typecheck: `npm run typecheck` must stay clean.
- After changing narration audio (`xkga/tts/trim-NN.wav`) or presenter clips: `python3 xkga/build_timeline.py` (regenerates `src/xkga/timeline.ts`, `xkga/timeline.json`, `public/xkga/voice-mix.wav`, `music-bed.wav`, `public/xkga/media/`). Never hand-edit `timeline.ts`.

## Rules
1. Do not invent facts. On-screen text and narration come only from `docs/` (`ra-loi-doc-video-ga-han-quoc_v02.md`, `ra-chu-tren-hinh-58-khoa_v01.md`, fact-check `kiem-chung-video-ga-han-quoc-20261009.json`). A change of fact goes into docs first, with a source.
2. Every visible word lives in `src/xkga/texts.ts`, `texts-info.ts`, `texts-rows.ts` — never hard-code strings in components.
3. The Vietnam map must keep the Hoàng Sa and Trường Sa archipelagos (`SatMap.tsx`, `vnIslands`). Do not remove or hide them.
4. Do not redraw real company logos; use the neutral badge from `T`.
5. Outputs go to `out/` (git-ignored). Do not commit renders; do not put files >50 MB in git.
6. Fonts load from `assets/fonts` (`src/xkga/font.ts`); keep rendering offline-capable.
7. Code, file names and comments in English; docs for people in Vietnamese.
8. No secrets in the repo. Regenerating AI clips (ChatCut Omni) costs credits — ask the owner first; prompts are in `docs/omni-prompts.md`.
