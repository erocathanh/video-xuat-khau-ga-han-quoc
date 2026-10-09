// Scene MapMarkets — reference 92.7–105.2 s (375 frames).
// 0–1.0 s close on South Korea (orange fill) with its pin; 1.0–4.3 s pull back to Eurasia, Vietnam pin pops;
// 4.0–7.8 s headline T.marketsHead; 8.3 s Japan; 9.8 s Hong Kong + Singapore;
// 10.3/10.6 s Cambodia + Laos (offset pins with leader lines); 11.3 s Russia lights up (fill); 11.7 s Mongolia.
// 8 market pins + Vietnam as origin. From 8.4 s the camera un-squeezes (sx -> 1) so the SE-Asia pins fit.
import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { C, FONT, HEAD_SHADOW, ease, pop, sec } from "./common";
import { Camera, Highlight, LonLat, MapPin, SatMap, cameraAt } from "./SatMap";
import { T } from "./texts";

export const MAP_MARKETS_FRAMES = 375;

type Market = {
  code: Highlight["code"];
  at: LonLat;
  sub: string;
  t: number;
  size: number;
  fillAt?: number;
  off?: [number, number]; // pin offset px (leader line) where pins would collide
};
const MARKETS: Market[] = [
  { code: "KOR", at: [127.9, 36.4], sub: T.mkKorea, t: 0, size: 92 },
  { code: "VNM", at: [105.8, 20.6], sub: T.mkVietnam, t: 1.6, size: 118 },
  { code: "JPN", at: [140.8, 40.2], sub: T.mkJapan, t: 8.3, size: 86 },
  { code: "HKG", at: [114.2, 22.35], sub: T.mkHongKong, t: 9.8, size: 70 },
  { code: "SGP", at: [103.85, 1.35], sub: T.mkSingapore, t: 10.0, size: 86 },
  { code: "KHM", at: [104.9, 12.6], sub: T.mkCambodia, t: 10.3, size: 78, off: [-165, 40] },
  { code: "LAO", at: [102.6, 19.6], sub: T.mkLaos, t: 10.6, size: 78, off: [-150, -20] },
  { code: "RUS", at: [96.0, 62.0], sub: T.mkRussia, t: 11.3, size: 104, fillAt: 11.1 },
  { code: "MNG", at: [103.0, 46.8], sub: T.mkMongolia, t: 11.7, size: 86 },
];

const K: [number, Camera][] = [
  [0, { lon: 127.8, lat: 35.6, zoom: 215, sx: 0.6 }],
  [sec(0.6), { lon: 127.8, lat: 35.7, zoom: 185, sx: 0.6 }],
  [sec(2.3), { lon: 114, lat: 28, zoom: 27, sx: 0.72 }],
  [sec(4.3), { lon: 108, lat: 34, zoom: 15.5, sx: 0.6 }],
  [sec(7.6), { lon: 110, lat: 33, zoom: 16.5, sx: 0.6 }],
  [sec(8.4), { lon: 120, lat: 30, zoom: 19.5, sx: 0.8 }],
  [sec(10.0), { lon: 116, lat: 24, zoom: 21, sx: 1.0 }],
  [sec(11.0), { lon: 115.5, lat: 26, zoom: 20, sx: 1.0 }],
  [sec(11.9), { lon: 115, lat: 31, zoom: 18, sx: 1.0 }],
  [MAP_MARKETS_FRAMES, { lon: 115, lat: 31, zoom: 17.6, sx: 1.0 }],
];

export const XkgaMapMarkets: React.FC = () => {
  const f = useCurrentFrame();
  const cam = cameraAt(f, K, Easing.inOut(Easing.cubic));

  const highlights: Highlight[] = [
    { code: "VNM", stroke: 1, width: 3 },
    ...MARKETS.filter((m) => m.code !== "VNM").map((m) => ({
      code: m.code,
      stroke: m.t === 0 ? 1 : ease(f, sec(m.t - 0.2), sec(m.t + 0.5)),
      fill:
        m.code === "KOR"
          ? 1 - ease(f, sec(0.8), sec(1.8))
          : m.fillAt !== undefined
            ? ease(f, sec(m.fillAt), sec(m.fillAt + 0.5))
            : 0,
      width: m.code === "KOR" && f < sec(1) ? 4.5 : 2.8,
    })),
  ];

  const pins: MapPin[] = MARKETS.map((m) => ({
    at: m.at,
    badge: T.pinInitials,
    title: T.pinBrand,
    sub: m.sub || undefined,
    size: m.size * Math.min(1.1, Math.max(0.9, cam.zoom / 16)),
    scale: m.t === 0 ? 1 : pop(f, sec(m.t)),
    dx: m.off?.[0],
    dy: m.off?.[1],
  }));

  const warm = 1 - ease(f, 0, sec(0.6));
  const head = pop(f, sec(4.0), 30, 11) * (1 - ease(f, sec(7.4), sec(7.9)));
  const floatY = Math.sin(f / 22) * 6;

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT }}>
      <SatMap cam={cam} highlights={highlights} vnIslands={1} pins={pins} warm={warm} />
      {head > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 60,
            top: 470 + floatY,
            textAlign: "center",
            fontWeight: 900,
            fontSize: Math.min(84, ...T.marketsHead.split("\n").map((l) => Math.floor(960 / (Array.from(l).length * 0.64)))),
            lineHeight: 1.0,
            color: C.orange,
            textShadow: HEAD_SHADOW,
            whiteSpace: "pre",
            transform: `rotate(-3deg) scale(${0.7 + 0.3 * head})`,
            opacity: Math.min(1, head * 1.5),
          }}
        >
          {T.marketsHead}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
