// Scene MapIntro — reference 0.0–12.7 s (381 frames).
// 0–1.3 s close on Vietnam, outline + Hoàng Sa / Trường Sa draw on; 1.3–2.4 s pull back to East Asia;
// 1.9–2.8 s arc Vietnam -> Korea with labels + arc text; 4.0–8.9 s blurred map + headline + blank paper stack;
// 9.2–12.7 s T.introYears / T.introYearsSub stacked headline over the map.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, HEAD_SHADOW, clamp, ease, pop, sec } from "./common";
import { Camera, LonLat, SatMap, cameraAt } from "./SatMap";
import { T } from "./texts";

export const MAP_INTRO_FRAMES = 381;

const VN: LonLat = [105.6, 21.0];
const KR: LonLat = [127.9, 36.6];

const CAM_CLOSE: Camera = { lon: 109.4, lat: 16.6, zoom: 58, sx: 0.74 };
const CAM_WIDE: Camera = { lon: 116.5, lat: 17.5, zoom: 23, sx: 0.85 };
const CAM_WIDE2: Camera = { lon: 117.5, lat: 18.5, zoom: 22, sx: 0.85 };

// Blank paper sheets (no text) that slide up and fan out — stands in for the questionnaires
// (introQuestions / introListNote are BỎ in the v01 text table).
const SHEETS = [
  { rot: -11, dx: -150, dy: 40 },
  { rot: -5, dx: -70, dy: 14 },
  { rot: 2, dx: 0, dy: 0 },
  { rot: 8, dx: 80, dy: 18 },
  { rot: 13, dx: 160, dy: 48 },
];
const PaperStack: React.FC<{ f: number }> = ({ f }) => (
  <>
    {SHEETS.map((sh, i) => {
      const inP = pop(f, sec(4.2) + i * 5, 30, 14);
      const fan = ease(f, sec(5.4), sec(6.4));
      const breathe = Math.sin((f - sec(4)) / 18 + i) * 3;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 540 - 200,
            top: 700,
            width: 400,
            height: 540,
            borderRadius: 10,
            background: "linear-gradient(160deg, #FFFDF6 0%, #F1EBDD 100%)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.12)",
            transformOrigin: "50% 100%",
            transform: `translate(${sh.dx * fan}px, ${(1 - inP) * 700 + sh.dy * fan + breathe}px) rotate(${sh.rot * fan}deg)`,
            opacity: Math.min(1, inP * 2),
          }}
        >
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 14, background: C.orange, borderRadius: "10px 10px 0 0", opacity: 0.85 }} />
        </div>
      );
    })}
  </>
);

export const XkgaMapIntro: React.FC = () => {
  const f = useCurrentFrame();
  const cam = cameraAt(
    f,
    [
      [0, { ...CAM_CLOSE, zoom: 64 }],
      [sec(1.3), CAM_CLOSE],
      [sec(2.4), CAM_WIDE],
      [MAP_INTRO_FRAMES, CAM_WIDE2],
    ],
    Easing.inOut(Easing.cubic),
  );

  const vnStroke = ease(f, sec(0.2), sec(1.1), 0, 1, Easing.out(Easing.quad));
  const arcP = ease(f, sec(1.9), sec(2.8));
  // Labels + arc text fade out before the «years» headline so they do not collide with it.
  const tagsOut = 1 - ease(f, sec(8.7), sec(9.2));
  const labelVn = ease(f, sec(1.8), sec(2.1)) * tagsOut;
  const labelKr = ease(f, sec(2.6), sec(2.9)) * tagsOut;
  const arcTextSize = Math.min(62, Math.floor(560 / Math.max(1, Array.from(T.arcText).length * 0.62)));

  // question-list phase
  const listIn = ease(f, sec(4.0), sec(4.5));
  const listOut = ease(f, sec(8.7), sec(9.1));
  const listVis = listIn * (1 - listOut);
  const blur = 9 * listVis;
  // Headline lines (introHead2 may contain "\n"); typed on as one string.
  const headLines = [T.introHead1, ...T.introHead2.split("\n")];
  const headLen = headLines.reduce((n, l) => n + l.length, 0);
  let typed = Math.floor(interpolate(f, [sec(4.0), sec(5.4)], [0, 1], clamp) * headLen);
  const headShown = headLines.map((l) => {
    const part = l.slice(0, Math.max(0, Math.min(l.length, typed)));
    typed -= l.length;
    return part;
  });

  // «5 NĂM» phase
  const y1 = pop(f, sec(9.2));
  const y2 = pop(f, sec(9.5));

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT }}>
      <SatMap
        cam={cam}
        blur={blur}
        dim={0.35 * listVis}
        highlights={[
          { code: "VNM", stroke: vnStroke, width: 3.4 },
          { code: "KOR", stroke: ease(f, sec(2.5), sec(3.0)), width: 3 },
        ]}
        vnIslands={ease(f, sec(0.5), sec(1.2))}
        arc={{ from: VN, to: KR, progress: arcP, bend: 0.22, text: T.arcText, textSize: arcTextSize, textOpacity: ease(f, sec(2.2), sec(2.6)) * tagsOut, tick: 34 }}
        labels={[
          { at: VN, text: T.labelVietnam, dy: -40, opacity: labelVn },
          { at: KR, text: T.labelKorea, dy: -40, opacity: labelKr },
        ]}
      />

      {listVis > 0 ? (
        <AbsoluteFill style={{ opacity: listVis }}>
          <div
            style={{
              position: "absolute",
              left: 60,
              right: 60,
              top: 380,
              textAlign: "center",
              fontWeight: 900,
              fontSize: Math.min(56, ...headLines.map((l) => Math.floor(960 / (Array.from(l).length * 0.62)))),
              lineHeight: 1.1,
              color: C.orange,
              textShadow: HEAD_SHADOW,
            }}
          >
            {headShown.map((l, i) => (
              <div key={i} style={{ whiteSpace: "pre" }}>{l || " "}</div>
            ))}
          </div>
          <PaperStack f={f} />
        </AbsoluteFill>
      ) : null}

      {f >= sec(9.2) ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", transform: "rotate(-3deg)" }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: Math.min(170, Math.floor(900 / (Array.from(T.introYears).length * 0.68))),
              lineHeight: 1,
              color: C.orange,
              textShadow: HEAD_SHADOW,
              transform: `scale(${y1})`,
              opacity: Math.min(1, y1 * 2),
            }}
          >
            {T.introYears}
          </div>
          <div
            style={{
              fontWeight: 900,
              fontSize: 84,
              lineHeight: 1.05,
              color: C.white,
              textShadow: HEAD_SHADOW,
              transform: `scale(${y2})`,
              opacity: Math.min(1, y2 * 2),
            }}
          >
            {T.introYearsSub}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
