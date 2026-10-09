// SatMap: dark satellite map engine for the xkga short.
// Background = NASA Blue Marble (public domain), world 5400x2700 + hi-res East-Asia crop
// (scripts/make_bluemarble_crop.py). Country outlines = Natural Earth 50m (public domain),
// extracted by scripts/extract_countries.py into ./data/countries.json.
// Projection: equirectangular with a horizontal squeeze (camera.sx), centred on the camera.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { C, FONT, GlowDefs, InitialsBadge, clamp } from "./common";
import { COUNTRIES } from "./data/countries";

export type LonLat = [number, number];
export type Camera = { lon: number; lat: number; zoom: number; sx: number };

// Hi-res crop window, must match scripts/make_bluemarble_crop.py
const DETAIL = { lon0: 95, lon1: 140, lat0: 45, lat1: -15 };

export const W = 1080;
export const H = 1920;

export const project = (cam: Camera, [lon, lat]: LonLat): [number, number] => [
  W / 2 + (lon - cam.lon) * cam.zoom * cam.sx,
  H / 2 - (lat - cam.lat) * cam.zoom,
];

// Interpolate a camera along keyframes [frame, Camera]. Zoom is interpolated in log space.
export const cameraAt = (
  f: number,
  keys: [number, Camera][],
  easing?: (t: number) => number,
): Camera => {
  const fr = keys.map((k) => k[0]);
  const pick = (g: (c: Camera) => number) =>
    interpolate(f, fr, keys.map((k) => g(k[1])), { ...clamp, easing });
  return {
    lon: pick((c) => c.lon),
    lat: pick((c) => c.lat),
    zoom: Math.exp(pick((c) => Math.log(c.zoom))),
    sx: pick((c) => c.sx),
  };
};

export type Highlight = {
  code: "VNM" | "KOR" | "JPN" | "SGP" | "HKG" | "RUS" | "KHM" | "LAO" | "MNG";
  stroke: number; // 0..1 draw-on progress
  fill?: number; // 0..1 orange fill opacity factor
  width?: number;
};

export type MapLabel = { at: LonLat; text: string; dy?: number; dx?: number; size?: number; opacity?: number; tick?: number };
export type MapPin = {
  at: LonLat;
  scale: number; // 0..1 pop progress
  badge: string;
  title: string;
  sub?: string;
  size?: number;
  // Optional screen offset (px) of the pin from its anchor; a dot + leader line marks the true spot.
  dx?: number;
  dy?: number;
};
export type MapArc = {
  from: LonLat;
  to: LonLat;
  progress: number; // 0..1
  bend?: number; // perpendicular offset as fraction of length (+ = sag south/right of travel)
  text?: string;
  textOpacity?: number;
  textSize?: number; // default 62
  tick?: number; // vertical tick length at both ends, px
};

const ringPath = (cam: Camera, rings: number[][][]) =>
  rings
    .map((r) => {
      let d = "";
      for (let i = 0; i < r.length; i++) {
        const [x, y] = project(cam, r[i] as LonLat);
        d += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
      }
      return d + "Z";
    })
    .join("");

// Smooth closed loop through points (Catmull-Rom -> cubic Bezier)
const smoothLoop = (pts: [number, number][]) => {
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + "Z";
};

// Vietnamese archipelagos (lon, lat). Loops drawn around them, plus small island marks.
const HOANG_SA_LOOP: LonLat[] = [
  [111.0, 16.3], [111.3, 15.6], [112.0, 15.7], [112.9, 16.1], [112.9, 16.9], [112.3, 17.25], [111.5, 17.0],
];
const TRUONG_SA_LOOP: LonLat[] = [
  [111.4, 8.9], [112.2, 7.6], [114.0, 7.9], [116.2, 8.9], [116.8, 10.4], [115.3, 11.6], [113.8, 11.2], [112.4, 10.2],
];
const VN_ISLANDS: LonLat[] = [
  [112.33, 16.83], [111.61, 16.53], [111.2, 15.78], [111.75, 16.45], [112.73, 16.67],
  [111.92, 8.64], [114.33, 11.43], [114.33, 9.88], [114.36, 10.18], [112.91, 7.89], [114.65, 10.7], [115.5, 10.0],
];

export const SatMap: React.FC<{
  cam: Camera;
  highlights?: Highlight[];
  vnIslands?: number; // 0..1, Hoàng Sa / Trường Sa marks
  arc?: MapArc;
  labels?: MapLabel[];
  pins?: MapPin[];
  blur?: number;
  dim?: number; // extra darkening 0..1
  warm?: number; // 0..1 orange tint of the whole map (transition look)
}> = ({ cam, highlights = [], vnIslands = 0, arc, labels = [], pins = [], blur = 0, dim = 0, warm = 0 }) => {
  const zx = cam.zoom * cam.sx;
  const zy = cam.zoom;
  // viewport in lon/lat
  const vLon0 = cam.lon - W / 2 / zx;
  const vLon1 = cam.lon + W / 2 / zx;
  const vLat0 = cam.lat + H / 2 / zy;
  const vLat1 = cam.lat - H / 2 / zy;
  const detailCovers =
    vLon0 >= DETAIL.lon0 + 0.5 && vLon1 <= DETAIL.lon1 - 0.5 && vLat0 <= DETAIL.lat0 - 0.5 && vLat1 >= DETAIL.lat1 + 0.5;
  const filter = `brightness(${0.86 - dim * 0.45}) saturate(0.85) contrast(1.08)`;

  const imgBox = (lon0: number, lat0: number, lonSpan: number, latSpan: number): React.CSSProperties => {
    const [x, y] = project(cam, [lon0, lat0]);
    return { position: "absolute", left: x, top: y, width: lonSpan * zx, height: latSpan * zy, maxWidth: "none" };
  };
  const feather = "linear-gradient(to right, transparent 0, #000 1.5%, #000 98.5%, transparent 100%)";
  const featherV = "linear-gradient(to bottom, transparent 0, #000 1.5%, #000 98.5%, transparent 100%)";

  let arcPath = "";
  let arcPts: { a: [number, number]; b: [number, number] } | null = null;
  if (arc) {
    const a = project(cam, arc.from);
    const b = project(cam, arc.to);
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const bend = arc.bend ?? 0.25;
    // perpendicular (rotate clockwise) -> sags downward for a west->east arc going up
    const cx = (a[0] + b[0]) / 2 - dy * bend;
    const cy = (a[1] + b[1]) / 2 + dx * bend;
    arcPath = `M${a[0]} ${a[1]} Q${cx} ${cy} ${b[0]} ${b[1]}`;
    arcPts = { a, b };
  }

  return (
    <AbsoluteFill style={{ background: "#03070C", overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: blur > 0 ? `blur(${blur}px)` : undefined }}>
        <AbsoluteFill style={{ filter }}>
          {!detailCovers ? (
            <>
              <Img src={staticFile("xkga/bluemarble.jpg")} style={imgBox(-180, 90, 360, 180)} />
              <Img src={staticFile("xkga/bluemarble.jpg")} style={imgBox(180, 90, 360, 180)} />
            </>
          ) : null}
          <Img
            src={staticFile("xkga/bluemarble-asia.jpg")}
            style={{
              ...imgBox(DETAIL.lon0, DETAIL.lat0, DETAIL.lon1 - DETAIL.lon0, DETAIL.lat0 - DETAIL.lat1),
              WebkitMaskImage: detailCovers ? undefined : `${feather}, ${featherV}`,
              WebkitMaskComposite: "source-in",
            }}
          />
        </AbsoluteFill>
        {/* night tint + vignette */}
        <AbsoluteFill
          style={{
            background: "radial-gradient(ellipse at 50% 45%, rgba(0,10,25,0) 40%, rgba(0,4,12,0.55) 100%)",
          }}
        />
        {warm > 0 ? (
          <AbsoluteFill style={{ background: C.orangeDeep, mixBlendMode: "color", opacity: warm * 0.8 }} />
        ) : null}

        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <GlowDefs id="satGlow" blur={7} />
          {highlights.map((h) => {
            const d = ringPath(cam, COUNTRIES[h.code]);
            const fill = h.fill ?? 0;
            return (
              <g key={h.code}>
                {fill > 0 ? <path d={d} fill={C.orangeDeep} opacity={0.5 * fill} /> : null}
                <path
                  d={d}
                  fill="none"
                  stroke={C.orange}
                  strokeWidth={h.width ?? 3.2}
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={`${h.stroke} 1`}
                  filter="url(#satGlow)"
                  opacity={h.stroke > 0 ? 1 : 0}
                />
              </g>
            );
          })}
          {vnIslands > 0 ? (
            <g opacity={vnIslands}>
              {[HOANG_SA_LOOP, TRUONG_SA_LOOP].map((loop, i) => (
                <path
                  key={i}
                  d={smoothLoop(loop.map((p) => project(cam, p)))}
                  fill="none"
                  stroke={C.orange}
                  strokeWidth={3}
                  pathLength={1}
                  strokeDasharray={`${vnIslands} 1`}
                  filter="url(#satGlow)"
                />
              ))}
              {VN_ISLANDS.map((p, i) => {
                const [x, y] = project(cam, p);
                return <circle key={i} cx={x} cy={y} r={Math.max(1.2, cam.zoom * 0.035)} fill={C.orangeHot} opacity={0.75} />;
              })}
            </g>
          ) : null}
          {arc && arcPts ? (
            <g>
              <path id="satArc" d={arcPath} fill="none" stroke="none" />
              <path
                d={arcPath}
                fill="none"
                stroke={C.yellow}
                strokeWidth={3}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={`${arc.progress} 1`}
                filter="url(#satGlow)"
              />
              {arc.tick ? (
                <>
                  <line x1={arcPts.a[0]} y1={arcPts.a[1]} x2={arcPts.a[0]} y2={arcPts.a[1] - arc.tick} stroke={C.yellow} strokeWidth={2} opacity={Math.min(1, arc.progress * 5)} />
                  <line x1={arcPts.b[0]} y1={arcPts.b[1]} x2={arcPts.b[0]} y2={arcPts.b[1] - arc.tick} stroke={C.yellow} strokeWidth={2} opacity={arc.progress >= 0.98 ? 1 : 0} />
                </>
              ) : null}
              {arc.text ? (
                <text
                  fontFamily={FONT}
                  fontWeight={900}
                  fontSize={arc.textSize ?? 62}
                  fill={C.orange}
                  opacity={arc.textOpacity ?? 1}
                  style={{ paintOrder: "stroke", letterSpacing: 4 }}
                  stroke="rgba(0,0,0,0.35)"
                  strokeWidth={4}
                  dy={-14}
                >
                  <textPath href="#satArc" startOffset="50%" textAnchor="middle">
                    {arc.text}
                  </textPath>
                </text>
              ) : null}
            </g>
          ) : null}
        </svg>

        {labels.map((l, i) => {
          const [x, y] = project(cam, l.at);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x + (l.dx ?? 0),
                top: y + (l.dy ?? -50),
                transform: "translate(-50%, -100%)",
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: l.size ?? 36,
                color: C.white,
                opacity: l.opacity ?? 1,
                whiteSpace: "nowrap",
                textShadow: "0 2px 6px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)",
              }}
            >
              {l.text}
            </div>
          );
        })}

        {pins.map((p, i) => {
          const [ax, ay] = project(cam, p.at);
          const x = ax + (p.dx ?? 0);
          const y = ay + (p.dy ?? 0);
          const s = p.size ?? 104;
          const lead = p.dx || p.dy;
          return (
            <React.Fragment key={i}>
            {lead ? (
              <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: Math.min(1, p.scale * 3) }}>
                <line x1={ax} y1={ay} x2={x} y2={y} stroke={C.pinFill} strokeWidth={2.5} strokeDasharray="6 5" />
                <circle cx={ax} cy={ay} r={7} fill={C.pinRing} stroke="#2A1A00" strokeWidth={2} />
              </svg>
            ) : null}
            <div
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: `translate(-50%, -100%) scale(${p.scale})`,
                transformOrigin: "50% 100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: Math.min(1, p.scale * 3),
              }}
            >
              <InitialsBadge text={p.badge} size={s} />
              <div
                style={{
                  marginTop: s * 0.12,
                  fontFamily: FONT,
                  fontWeight: 800,
                  fontSize: s * 0.18,
                  lineHeight: 1.05,
                  color: C.pinFill,
                  textAlign: "center",
                  whiteSpace: "pre",
                  textShadow: "0 0 3px #000, 0 2px 4px rgba(0,0,0,0.9)",
                }}
              >
                {p.sub ? `${p.title}\n${p.sub}` : p.title}
              </div>
              <svg width={s * 0.26} height={s * 0.34} viewBox="0 0 24 32" style={{ marginTop: s * 0.04 }}>
                <path d="M12 1C6 1 1.5 5.5 1.5 11.3 1.5 19 12 31 12 31s10.5-12 10.5-19.7C22.5 5.5 18 1 12 1z" fill={C.pinFill} stroke="#2A1A00" strokeWidth={1.4} />
                <circle cx={12} cy={11.5} r={4} fill="#3A2A10" />
              </svg>
            </div>
            </React.Fragment>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
