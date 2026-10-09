# Brief: rebuild the graphics of a vertical news-style short in Remotion

Reference: /Users/erocathanh/DU-AN/video-studio/nghien-cuu/DAU-VAO/tham-khao-yt-dKTTUHPec1k/goc.mp4 (1080x1920, 30 fps, 126 s), contact sheet contact.jpg (one frame per 3 s), transcript goc.srt. Stills at /Users/erocathanh/Development/video-studio/xkga/ref/tNNN.png (NNN = second). Pull more frames with ffmpeg into /private/tmp/claude-501/xkga-<you>/.

Project: /Users/erocathanh/Development/video-studio (Remotion 4, React 19). Work ONLY in a new folder src/xkga/ (shared kit in src/xkga/common.tsx — if it exists, reuse it; if you are the first, create it) plus one Composition line per test in src/Root.tsx. Canvas 1080x1920, 30 fps. Keep y 1450–1700 free for subtitles (added later).

Look of the reference:
1. Satellite map scenes: dark night-style satellite imagery of East/South-East Asia, Vietnam outline glowing orange (thick orange stroke with outer glow), camera zooms from space onto Vietnam, a glowing orange arc from Vietnam to South Korea with labels «Việt Nam», «Hàn Quốc», big bold orange/white headline text stacked, the CP-style round pin markers on many countries later.
2. Infographic scenes: black background, orange line icons in dark rounded tiles with thin orange borders, captions under icons, a grid that builds up step by step (2 agencies, 8 evaluation steps), green badge «100% đạt chuẩn», red warning badge, a «XỬ LÝ NHIỆT» block with >80°C, >=60s, «tách biệt» tiles and a heat-process diagram.
Font: Be Vietnam Pro (already used in src/flowmo via @remotion/google-fonts/BeVietnamPro with the vietnamese subset).

Text rule: every visible word comes from a text table file (src/xkga/texts.ts, object T with keys); for now copy the reference's on-screen strings verbatim as placeholders — they will be replaced by the new script. Brand logos of real companies (CP logo, C.P. Vietnam factory) must NOT be redrawn: use a neutral placeholder badge (circle with initials from T).

Map data: Vietnamese territory must include Hoàng Sa and Trường Sa archipelagos as small island marks. For coastlines use public-domain Natural Earth data: download once with curl from https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson into src/xkga/data/ (keep only the countries you need, write a small script scripts/extract_countries.py that does it, so the repo can rebuild). For the satellite background use NASA Blue Marble (public domain): download one image (e.g. https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg) into public/xkga/, darken/tint it in CSS to the night look. If either download fails, report it and fall back to a stylised dark ocean + land fill from the geojson.

Check: `npx tsc --noEmit -p . 2>&1 | grep xkga` empty; render stills with `--bundle-cache=false`, compare with ref, iterate. No package installs, no git discard commands, do not scan /Volumes.
Final answer: files, scenes built with frame ranges, what matches and what does not, any download problems.
