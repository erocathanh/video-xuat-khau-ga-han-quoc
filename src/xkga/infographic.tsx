// XkgaInfographic — rebuild of the reference infographic build-up (≈37.1–75.5 s of goc.mp4).
// One continuous scene: agencies -> date -> inspection bar -> "8 steps" grid (pops in sync
// with the spoken list, goc.srt lines 8–10) -> green/red badges -> heat-treatment block,
// diagram and yellow warning. Camera = vertical pan over a tall "world" (no zoom).
// All visible words come from T_INFO (texts-info.ts).
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "./font";
import { T_INFO as T } from "./texts-info";

export const XKGA_INFO_FPS = 30;
/** Reference second where this scene starts; all cue times below are reference seconds. */
export const XKGA_INFO_START = 37.1;
export const XKGA_INFO_DURATION_S = 38.4;
export const XKGA_INFO_FRAMES = Math.round(XKGA_INFO_DURATION_S * XKGA_INFO_FPS); // 1152

const IC = {
  bg: "#141414",
  orange: "#FF9417",
  orangeHi: "#FFA21F",
  yellow: "#F7D04E",
  yellowText: "#F9D65C",
  white: "#F4F4F4",
  tileBorder: "rgba(235,235,235,0.85)",
  tileBg: "rgba(10,10,10,0.55)",
  green: "#A6F04B",
  red: "#FF2B2B",
  redDim: "#E0262B",
  warnYellow: "#F9DE6F",
};

/** Cue table (reference seconds). Step pops follow the spoken list in goc.srt 9–10. */
const CUE_REF = {
  apqa: 37.1,
  mfds: 37.5,
  spread: 41.3, // APQA/MFDS slide apart to make room for the date tile
  date: 41.95,
  bar: 45.0,
  label: 47.4,
  steps: [49.2, 50.3, 51.2, 51.7, 52.4, 53.2, 54.0, 54.5],
  okBadge: 56.0,
  noBadge: 58.7, // unused since badgeNo = BỎ; kept so cue overrides stay compatible
  heatTitle: 63.0,
  heatSub: 63.8,
  heatTiles: [64.1, 65.8, 67.9],
  diagram: 70.6,
  noCross: 71.3,
  warning: 72.0,
};
export type XkgaInfoCues = typeof CUE_REF;

/** Step labels drive the tile count (T_INFO.steps). Reference cues are used for 8 tiles,
 *  otherwise the pops are spread evenly over the same window. */
const STEP_TEXT: readonly string[] = T.steps;
const N_STEPS = STEP_TEXT.length;
const defaultStepCues = (n: number) =>
  n === CUE_REF.steps.length
    ? CUE_REF.steps
    : Array.from({ length: n }, (_, i) => CUE_REF.steps[0] + (n === 1 ? 0 : (i * (54.5 - CUE_REF.steps[0])) / (n - 1)));

/** Camera keyframes: [reference second, world->screen y offset]. */
const CAM: [number, number, ((t: number) => number)?][] = [
  [37.1, 752],
  [44.2, 752],
  [45.0, 680, Easing.inOut(Easing.cubic)],
  [47.0, 646, Easing.inOut(Easing.quad)],
  [48.6, 640, Easing.linear],
  [50.0, 0, Easing.inOut(Easing.cubic)],
  [62.3, 0],
  [63.8, -910, Easing.inOut(Easing.cubic)],
  [70.4, -910],
  [72.8, -1345, Easing.out(Easing.cubic)],
];

const camAt = (t: number) => {
  if (t <= CAM[0][0]) return CAM[0][1];
  for (let i = 1; i < CAM.length; i++) {
    const [t1, v1, ease] = CAM[i];
    const [t0, v0] = CAM[i - 1];
    if (t <= t1) {
      const p = (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * (ease ?? Easing.linear)(p);
    }
  }
  return CAM[CAM.length - 1][1];
};

const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return XKGA_INFO_START + f / fps;
};

/** Spring 0..1 that starts at reference second `at`. */
const usePop = (at: number, damping = 13) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - (at - XKGA_INFO_START) * fps, fps, config: { damping, mass: 0.7 } });
};

const Pop: React.FC<{
  at: number;
  x: number;
  y: number;
  w: number;
  h: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, x, y, w, h, children, style }) => {
  const p = usePop(at);
  if (p <= 0.001) return null;
  const blur = Math.max(0, (1 - Math.min(p, 1)) * 10);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: Math.min(1, p * 1.6),
        transform: `scale(${0.55 + 0.45 * p})`,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const lines = (s: string) =>
  s.split("\n").map((l, i) => (
    <React.Fragment key={i}>
      {i > 0 && <br />}
      {l}
    </React.Fragment>
  ));

const glowOrange = "0 0 18px rgba(255,148,23,0.35)";

// ---------------------------------------------------------------- line icons (viewBox 64)
const Svg: React.FC<{ size: number; color?: string; sw?: number; children: React.ReactNode; w?: number }> = ({
  size,
  color = IC.orange,
  sw = 2.4,
  children,
  w,
}) => (
  <svg
    width={w ?? size}
    height={size}
    viewBox={`0 0 ${w ? (64 * w) / size : 64} 64`}
    fill="none"
    stroke={color}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ filter: `drop-shadow(0 0 6px ${color}55)`, overflow: "visible" }}
  >
    {children}
  </svg>
);

const IcBank: React.FC<{ size: number }> = ({ size }) => (
  <Svg size={size} w={size * 1.05}>
    <path d="M6 22L33 6l27 16z" />
    <circle cx="33" cy="15" r="3" />
    <path d="M6 22h54M9 26h48M12 26v26M19 26v26M47 26v26M54 26v26M24 52V32h18v20M33 32v20M31 41v2M35 41v2M7 52h52M4 57h58" />
  </Svg>
);
const IcCalendar: React.FC<{ size: number }> = ({ size }) => (
  <Svg size={size}>
    <rect x="6" y="11" width="48" height="42" rx="6" />
    <path d="M6 21h48M17 6v9M30 6v9M43 6v9" />
    {[0, 1, 2].map((r) =>
      [0, 1, 2, 3].map((c) =>
        r === 2 && c > 1 ? null : <rect key={`${r}${c}`} x={12 + c * 9} y={27 + r * 8} width="5" height="4" rx="1" />,
      ),
    )}
    <circle cx="48" cy="48" r="11" fill={IC.bg} />
    <path d="M43 48l4 4 7-8" />
  </Svg>
);
const IcClipInspector: React.FC<{ size: number }> = ({ size }) => (
  <Svg size={size}>
    <rect x="4" y="6" width="34" height="52" rx="3" />
    <path d="M14 3h14v7H14z" />
    {[0, 1, 2, 3].map((i) => (
      <React.Fragment key={i}>
        <rect x="9" y={16 + i * 10} width="5" height="5" rx="1" />
        <path d={`M18 ${18 + i * 10}h14`} />
      </React.Fragment>
    ))}
    <circle cx="48" cy="9" r="5" />
    <path d="M46 9l1.5 1.5L50 8" />
    <path d="M38 34c0-6 4-9 9-9s9 3 9 9M37 34h20" />
    <path d="M40 34c0 5 3 8 7 8s7-3 7-8" />
    <path d="M30 60c0-9 7-14 17-14s17 5 17 14zM47 46v14M42 46l5 6 5-6" />
  </Svg>
);
const IcFactory: React.FC<{ size: number }> = ({ size }) => (
  <Svg size={size}>
    <path d="M4 58h56M8 58V26l24-6v38M32 30h26v28" />
    <path d="M40 30V6h4v24M50 30V4h4v26" />
    <path d="M12 32h6v6h-6zM12 44h6v6h-6zM16 58v-6h10v6" />
    {[0, 1, 2].map((c) =>
      [0, 1].map((r) => <rect key={`${c}${r}`} x={36 + c * 7} y={37 + r * 9} width="4" height="5" rx="0.8" />),
    )}
    <path d="M6 28L4 24l28-8 2 4" />
  </Svg>
);
const IcBarn: React.FC<{ size: number }> = ({ size }) => (
  <Svg size={size}>
    <path d="M14 26l14-12 14 12M17 23v24h22V23" />
    <rect x="22" y="33" width="12" height="14" />
    <path d="M22 33l12 14M34 33L22 47M23 25h4v4h-4zM30 25h4v4h-4z" />
    <path d="M44 47V18a7 7 0 0 1 14 0v29M44 24h14M44 31h14M44 38h14" />
    <path d="M6 54c-3-1-4-4-2-6 1 0 2 1 3 0l2-3c2-1 4 0 4 2 4 1 5 4 3 7-2 1-6 2-10 0zM8 54l-1 4M12 55v3" />
    <path d="M20 54l2 2 2-2M30 53l2 2 2-2M40 54l2 2 2-2M50 52l2 2 2-2" />
  </Svg>
);
const IcShieldVirus: React.FC<{ size: number }> = ({ size }) => (
  <Svg size={size}>
    <path d="M28 4L6 12v16c0 15 10 27 22 32 6-2 11-6 15-11" />
    <path d="M28 10l-16 6v12c0 11 7 20 16 24" />
    <path d="M14 30h8v-8h8v8h8v8h-8v8h-8v-8h-8z" />
    <circle cx="46" cy="18" r="8" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
      const r = (a * Math.PI) / 180;
      return (
        <path
          key={a}
          d={`M${46 + 8 * Math.cos(r)} ${18 + 8 * Math.sin(r)}L${46 + 12 * Math.cos(r)} ${18 + 12 * Math.sin(r)}`}
        />
      );
    })}
    <circle cx="44" cy="16" r="1.5" />
    <circle cx="49" cy="20" r="1.5" />
    <circle cx="50" cy="42" r="5" />
    <circle cx="40" cy="54" r="4" />
  </Svg>
);
const IcButcher: React.FC<{ size: number }> = ({ size }) => (
  <Svg size={size}>
    <path d="M22 16c0-7 4-11 10-11s10 4 10 11M21 16h22" />
    <path d="M24 17c0 9 3 15 8 15s8-6 8-15" />
    <path d="M12 58c0-12 8-20 20-20s20 8 20 20" />
    <path d="M4 34l40 20 4-4L8 30z" />
    <path d="M44 54l6 4M48 50l6 2" />
    <path d="M10 40c-2 3-2 5 0 6s3-3 0-6zM16 46c-2 3-2 5 0 6s3-3 0-6z" />
  </Svg>
);
const IcConveyor: React.FC<{ size: number }> = ({ size }) => (
  <Svg size={size}>
    <rect x="6" y="4" width="16" height="14" rx="1" />
    <path d="M11 4v5h6V4M10 22h12" />
    <path d="M32 12a9 9 0 0 1 18 0M30 12h22M36 6V3h6v3" />
    <path d="M33 13c0 6 3 10 8 10s8-4 8-10M26 36c0-8 6-12 15-12s15 4 15 12" />
    <rect x="4" y="36" width="56" height="12" rx="6" />
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx={11 + i * 10.5} cy="42" r="3.2" />
    ))}
    <path d="M6 56h52M10 48v8M54 48v8" />
  </Svg>
);
const IcPhoneThermo: React.FC<{ size: number }> = ({ size }) => (
  <Svg size={size}>
    <rect x="14" y="2" width="22" height="40" rx="4" />
    <path d="M19 12h12M19 18h12M19 24h12M23 10v4M27 16v4M22 22v4" />
    <path d="M10 30c-2 3-3 7-1 11l6 9v9h18v-7c3-3 5-6 5-11V34" />
    <path d="M12 46l6-8c2-2 5 0 4 3l-3 5" />
    <path d="M46 8a5 5 0 0 1 10 0v32a8 8 0 1 1-10 0z" />
    <circle cx="51" cy="46" r="3.5" />
    <path d="M51 42V16M40 14h3M40 20h3M40 26h3M40 32h3" />
    <circle cx="61" cy="4" r="2" />
  </Svg>
);
const IcBox: React.FC<{ size: number }> = ({ size }) => (
  <Svg size={size}>
    <path d="M32 4L6 16v32l26 12 26-12V16z" />
    <path d="M6 16l26 12 26-12M32 28v32M19 10l26 12v10" />
    <path d="M38 33l4-2v8l-2-2-2 3zM12 44l8 4M12 48l6 3" />
  </Svg>
);
const IcTruck: React.FC<{ size: number }> = ({ size }) => (
  <Svg size={size} w={size * 1.15}>
    <rect x="2" y="10" width="44" height="34" rx="2" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <path key={i} d={`M${9 + i * 5} 16v18`} />
    ))}
    <path d="M46 20h14l8 12v12H46zM50 24v8h14" />
    <circle cx="16" cy="50" r="6" />
    <circle cx="56" cy="50" r="6" />
    <path d="M22 50h28M2 44v6h8M62 44h6M66 36h2" />
  </Svg>
);
const IcSeparate: React.FC<{ size: number }> = ({ size }) => (
  <Svg size={size} sw={3.4}>
    <path d="M8 4v12a6 6 0 0 0 6 6h36a6 6 0 0 0 6-6V4" />
    <path d="M8 32h6M18 32h6M28 32h6M38 32h6M48 32h8" />
    <path d="M8 60V48a6 6 0 0 1 6-6h36a6 6 0 0 1 6 6v12" />
  </Svg>
);
const IcShieldCheck: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg size={size} color={color} sw={2.6}>
    <path d="M32 3L8 12v17c0 15 10 26 24 32 14-6 24-17 24-32V12z" />
    <path d="M32 10l-17 6v13c0 11 7 19 17 24 10-5 17-13 17-24V16z" />
    <path d="M22 32l7 7 13-14" />
  </Svg>
);
// Icon order per tile count (index-matched to T_INFO.steps); other counts cycle the 8-list.
const STEP_ICONS_8 = [IcBarn, IcShieldVirus, IcFactory, IcButcher, IcConveyor, IcPhoneThermo, IcBox, IcTruck];
const STEP_ICONS_6 = [IcBarn, IcShieldVirus, IcButcher, IcConveyor, IcPhoneThermo, IcTruck];
const stepIcon = (i: number) => (N_STEPS === 6 ? STEP_ICONS_6[i] : STEP_ICONS_8[i % STEP_ICONS_8.length]);

// ---------------------------------------------------------------- tiles
const tileBox = (border = IC.tileBorder, glow = "rgba(255,255,255,0.08)"): React.CSSProperties => ({
  position: "absolute",
  inset: 0,
  border: `2.5px solid ${border}`,
  borderRadius: 22,
  background: IC.tileBg,
  boxShadow: `0 0 16px ${glow}, inset 0 0 18px rgba(255,255,255,0.03)`,
  boxSizing: "border-box",
});

const AgencyTile: React.FC<{ name: string; desc: string }> = ({ name, desc }) => (
  <>
    <div style={tileBox()} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 22, display: "flex", justifyContent: "center" }}>
      <IcBank size={122} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 148,
        textAlign: "center",
        color: IC.orangeHi,
        fontSize: 40,
        fontWeight: 800,
        textShadow: glowOrange,
      }}
    >
      {name}
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 200,
        textAlign: "center",
        color: IC.white,
        fontSize: 19,
        fontStyle: "italic",
        fontWeight: 500,
        lineHeight: 1.3,
      }}
    >
      {lines(desc)}
    </div>
  </>
);

const DateTile: React.FC = () => (
  <>
    <div style={tileBox()} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 22, display: "flex", justifyContent: "center" }}>
      <IcCalendar size={108} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 150,
        textAlign: "center",
        color: IC.white,
        fontSize: 23,
        fontStyle: "italic",
        fontWeight: 600,
        lineHeight: 1.3,
      }}
    >
      {lines(T.dateRange)}
    </div>
  </>
);

const StepTile: React.FC<{ i: number; w: number }> = ({ i, w }) => {
  const Icon = stepIcon(i);
  return (
    <>
      <div style={tileBox(IC.yellow, "rgba(247,208,78,0.18)")} />
      <div
        style={{
          position: "absolute",
          left: w / 2 - 27,
          top: -36,
          width: 54,
          height: 54,
          borderRadius: 27,
          background: IC.yellow,
          color: "#151515",
          fontWeight: 800,
          fontSize: 25,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 0 6px #141414",
        }}
      >
        {String(i + 1).padStart(2, "0")}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 16, display: "flex", justifyContent: "center" }}>
        <Icon size={126} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 152,
          textAlign: "center",
          color: IC.white,
          fontSize: 25,
          fontStyle: "italic",
          fontWeight: 700,
          lineHeight: 1.3,
        }}
      >
        {lines(STEP_TEXT[i])}
      </div>
    </>
  );
};

// Only the green badge remains (badgeNo = BỎ in the v01 text table).
const Badge: React.FC = () => {
  const col = IC.green;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        border: `2.5px solid ${col}`,
        borderRadius: 20,
        background: "rgba(70,110,20,0.12)",
        boxShadow: `0 0 18px ${col}44`,
        display: "flex",
        alignItems: "center",
        gap: 22,
        paddingLeft: 18,
        boxSizing: "border-box",
      }}
    >
      <IcShieldCheck size={84} color={col} />
      <div
        style={{
          color: col,
          fontWeight: 700,
          fontSize: 35,
          lineHeight: 1.25,
          textAlign: "center",
          flex: 1,
          paddingRight: 12,
          textShadow: `0 0 12px ${col}55`,
        }}
      >
        {lines(T.badgeOk)}
      </div>
    </div>
  );
};

/** Font size that keeps one line of `s` inside `w` px (rough per-char width factor). */
const fit = (s: string, max: number, w: number, k = 0.62) => Math.min(max, Math.floor(w / (Array.from(s).length * k)));

const HeatTile: React.FC<{ kind: 0 | 1 | 2 }> = ({ kind }) => {
  const value = [T.heatTempValue, T.heatTimeValue, T.heatSepValue][kind];
  const label = [T.heatTempLabel, T.heatTimeLabel, T.heatSepLabel][kind];
  const vSize = fit(value, kind === 2 ? 50 : 66, 240, 0.66);
  return (
    <>
      <div style={tileBox()} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 20, display: "flex", justifyContent: "center" }}>
        {kind === 2 ? <IcSeparate size={118} /> : <IcPhoneThermo size={122} />}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 150 + (66 - vSize) * 0.5,
          textAlign: "center",
          color: IC.orangeHi,
          fontSize: vSize,
          fontWeight: 900,
          letterSpacing: kind === 2 ? -1 : -2,
          textShadow: glowOrange,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 228,
          textAlign: "center",
          color: IC.white,
          fontSize: fit(label, 22, 250, 0.6),
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </>
  );
};

// ---------------------------------------------------------------- heat diagram
const Pill: React.FC<{ text: string; col: string; w: number; size?: number }> = ({ text, col, w, size = 24 }) => (
  <div
    style={{
      width: w,
      border: `2px solid ${col}`,
      borderRadius: 10,
      color: col,
      fontWeight: 700,
      fontSize: size,
      textAlign: "center",
      padding: "6px 0",
      boxSizing: "border-box",
      background: "rgba(0,0,0,0.4)",
    }}
  >
    {text}
  </div>
);

const Tray: React.FC<{ cooked: boolean }> = ({ cooked }) => (
  <svg width={200} height={110} viewBox="0 0 200 110">
    {cooked ? (
      <>
        <path d="M70 22c-6-10 4-18 8-8M80 18c-2-12 10-14 8-2" stroke="#7BD14A" strokeWidth="4" fill="none" opacity="0.8" />
        <ellipse cx="80" cy="58" rx="42" ry="24" fill="#C8641E" />
        <ellipse cx="72" cy="50" rx="22" ry="10" fill="#E08A3A" opacity="0.8" />
        <path d="M118 52l20-10" stroke="#C8641E" strokeWidth="10" strokeLinecap="round" />
        <circle cx="140" cy="40" r="6" fill="#F2E3C8" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={140 + i * 6} y={40 + i * 9} width="46" height="22" rx="4" fill="#9AA1A8" stroke="#E6E9EC" strokeWidth="2" />
        ))}
      </>
    ) : (
      [0, 1, 2].map((i) => (
        <g key={i}>
          <ellipse cx={55 + i * 45} cy={58 - (i % 2) * 4} rx="36" ry="18" fill="#F2B79C" />
          <ellipse cx={48 + i * 45} cy={52 - (i % 2) * 4} rx="16" ry="6" fill="#F8D0BD" />
        </g>
      ))
    )}
    <path d="M8 66h184l-14 34H22z" fill="#5E646B" stroke="#C9CED3" strokeWidth="3" />
    <path d="M4 64h192" stroke="#DDE1E5" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const Oven: React.FC<{ t: number }> = ({ t }) => {
  const flick = (k: number) => 0.85 + 0.15 * Math.sin(t * 9 + k * 1.7);
  return (
    <svg width={330} height={250} viewBox="0 0 330 250">
      <defs>
        <radialGradient id="xkgaOvenGlow" cx="0.5" cy="0.6" r="0.6">
          <stop offset="0" stopColor="#FF6A1A" />
          <stop offset="1" stopColor="#7A0A06" />
        </radialGradient>
      </defs>
      <rect x="92" y="0" width="150" height="16" rx="4" fill="#A7ADB3" />
      <rect x="62" y="12" width="210" height="182" rx="14" fill="#8C9298" stroke="#DCE0E4" strokeWidth="4" />
      <rect x="78" y="30" width="160" height="140" rx="6" fill="url(#xkgaOvenGlow)" stroke="#444" strokeWidth="4" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x="90" y={44 + i * 12} width="136" height="5" rx="2.5" fill="#FFB347" opacity={flick(i)} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M${104 + i * 27} 150c-10-12 4-18 0-30 10 8 12 18 4 30`}
          fill="#FFC23A"
          opacity={flick(i + 3)}
        />
      ))}
      <rect x="246" y="60" width="18" height="72" rx="4" fill="#5B6167" />
      <circle cx="255" cy="74" r="6" fill="#47D35A" />
      <circle cx="255" cy="96" r="6" fill="#FF3A2E" />
      <circle cx="255" cy="118" r="6" fill="#47D35A" />
      <rect x="4" y="180" width="322" height="30" rx="15" fill="#2C2F33" stroke="#C9CED3" strokeWidth="4" />
      {[22, 52, 112, 162, 212, 278, 308].map((x) => (
        <circle key={x} cx={x} cy="195" r="9" fill="#1A1C1F" stroke="#C9CED3" strokeWidth="3" />
      ))}
      <path d="M92 210v30M238 210v30" stroke="#A7ADB3" strokeWidth="8" />
    </svg>
  );
};

// Columns keep only the neutral labels + trays (desc/zone/note = BỎ in the v01 text table).
const HeatDiagram: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={{ ...tileBox(), borderRadius: 26 }} />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 22,
        textAlign: "center",
        color: IC.orangeHi,
        fontSize: 40,
        fontWeight: 700,
        textShadow: glowOrange,
      }}
    >
      {T.diagTitle}
    </div>
    {/* dashed dividers */}
    <div style={{ position: "absolute", left: 296, top: 110, height: 270, borderLeft: `4px dashed ${IC.red}` }} />
    <div style={{ position: "absolute", left: 566, top: 110, height: 270, borderLeft: `4px dashed ${IC.green}` }} />
    {(
      [
        { x: 18, col: IC.red, head: T.diagBefore, cooked: false },
        { x: 594, col: IC.green, head: T.diagAfter, cooked: true },
      ] as const
    ).map((c) => (
      <div key={c.x} style={{ position: "absolute", left: c.x, top: 150, width: 252, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Pill text={c.head} col={c.col} w={252} size={23} />
        <div style={{ marginTop: 40 }}>
          <Tray cooked={c.cooked} />
        </div>
      </div>
    ))}
    <div style={{ position: "absolute", left: 265, top: 128 }}>
      <Oven t={t} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 384,
        textAlign: "center",
        color: IC.orangeHi,
        fontSize: 30,
        fontWeight: 800,
        lineHeight: 1.12,
        textShadow: glowOrange,
      }}
    >
      {lines(T.diagOvenSpec)}
    </div>
  </>
);

const NoCross: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 270 - 54, top: 0, width: 108, height: 108 }}>
      <svg width={108} height={108} viewBox="0 0 108 108">
        <circle cx="54" cy="54" r="48" fill="#141414" stroke={IC.red} strokeWidth="7" />
        <g stroke="#E8E8E8" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M30 32v8a5 5 0 0 0 5 5h38a5 5 0 0 0 5-5v-8M30 56h48" strokeDasharray="6 5" />
          <path d="M30 76v-8a5 5 0 0 1 5-5h38a5 5 0 0 1 5 5v8" />
        </g>
        <path d="M22 86L86 22" stroke={IC.red} strokeWidth="7" />
      </svg>
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 77,
        width: 540,
        height: 86,
        border: `2.5px solid ${IC.red}`,
        borderRadius: 16,
        background: "rgba(20,4,4,0.88)",
        textAlign: "center",
        boxSizing: "border-box",
        paddingTop: 8,
      }}
    >
      <div style={{ color: IC.red, fontWeight: 800, fontSize: 31, lineHeight: 1.1 }}>{T.noCrossTitle}</div>
      <div style={{ color: IC.white, fontWeight: 500, fontSize: 20, marginTop: 4 }}>{T.noCrossSub}</div>
    </div>
  </>
);

const Warning: React.FC = () => (
  <>
    <div style={{ ...tileBox(IC.warnYellow, "rgba(249,222,111,0.2)") }} />
    <div style={{ position: "absolute", left: 44, top: 14 }}>
      <svg width={140} height={120} viewBox="0 0 164 140">
        <path d="M82 8L8 132h148z" fill={IC.warnYellow} stroke="#111" strokeWidth="12" strokeLinejoin="round" />
        <path d="M82 50v40" stroke="#111" strokeWidth="14" strokeLinecap="round" />
        <circle cx="82" cy="110" r="8" fill="#111" />
      </svg>
    </div>
    <div style={{ position: "absolute", left: 214, top: 22, color: IC.warnYellow, fontSize: 27, fontWeight: 700 }}>
      {T.warnTop}
    </div>
    <div
      style={{
        position: "absolute",
        left: 212,
        top: 58,
        color: IC.warnYellow,
        fontSize: fit(T.warnMain, 55, 620, 0.66),
        fontWeight: 900,
        letterSpacing: -1.5,
        textShadow: "0 0 16px rgba(249,222,111,0.35)",
      }}
    >
      {T.warnMain}
    </div>
  </>
);

/** Typewriter reveal of a heading (chars appear between `from` and `to`). */
const TypeOn: React.FC<{ text: string; from: number; to: number; t: number }> = ({ text, from, to, t }) => {
  const chars = Array.from(text);
  const n = Math.round(interpolate(t, [from, to], [0, chars.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <>
      <span>{chars.slice(0, n).join("")}</span>
      <span style={{ opacity: 0 }}>{chars.slice(n).join("")}</span>
    </>
  );
};

// ---------------------------------------------------------------- scene
// Grid area x 108..972 (864 px), rows at y 712 / 1017. 4 columns for 7-8 tiles, 3 for up to 6.
const GRID_Y = [712, 1017];
const LABEL_W = Math.min(864, Math.max(376, Array.from(T.stepsLabel).length * 25 + 60));
const GRID_COLS = N_STEPS > 6 ? 4 : 3;
const TILE_W = GRID_COLS === 4 ? 190 : 250;
const GRID_GAP = (864 - GRID_COLS * TILE_W) / (GRID_COLS - 1);
const gridPos = (i: number) => {
  const row = Math.floor(i / GRID_COLS);
  const inRow = Math.min(GRID_COLS, N_STEPS - row * GRID_COLS);
  const rowW = inRow * TILE_W + (inRow - 1) * GRID_GAP;
  return { x: 108 + (864 - rowW) / 2 + (i % GRID_COLS) * (TILE_W + GRID_GAP), y: GRID_Y[Math.min(row, GRID_Y.length - 1)] };
};

/** okBadgeY: world y of the green badge (1345 = under the grid, as in the reference; 2950 = under the warning). */
export const XkgaInfographic: React.FC<{ cues?: Partial<XkgaInfoCues>; okBadgeY?: number }> = ({ cues, okBadgeY = 1345 }) => {
  const CUE: XkgaInfoCues = { ...CUE_REF, steps: defaultStepCues(N_STEPS), ...cues };
  const t = useT();
  const off = camAt(t);
  // Vertical motion blur while the camera pans fast (reference shows smear during pans).
  const vel = Math.abs(camAt(t + 1 / 60) - camAt(t - 1 / 60)); // px per frame
  const mBlur = Math.min(6, vel * 0.12);

  // APQA / MFDS start side by side (pair centred), then spread for the date tile.
  const spread = interpolate(t, [CUE.spread, CUE.spread + 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const apqaX = 244 + (108 - 244) * spread;
  const mfdsX = 558 + (702 - 558) * spread;


  const subP = usePop(CUE.heatSub);

  return (
    <AbsoluteFill style={{ background: IC.bg, fontFamily: FONT, overflow: "hidden" }}>
      {/* grid paper, moves with the camera */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.045) 2px, transparent 2px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0px ${((off % 90) + 90) % 90}px`,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)" }} />

      <div style={{ position: "absolute", left: 0, top: off, width: 1080, height: 3000, whiteSpace: "nowrap", filter: mBlur > 0.4 ? `blur(${mBlur.toFixed(1)}px)` : undefined }}>
        <Pop at={CUE.apqa} x={apqaX} y={0} w={272} h={275}>
          <AgencyTile name={T.agency1Name} desc={T.agency1Desc} />
        </Pop>
        <Pop at={CUE.mfds} x={mfdsX} y={0} w={272} h={275}>
          <AgencyTile name={T.agency2Name} desc={T.agency2Desc} />
        </Pop>
        <Pop at={CUE.date} x={425} y={20} w={230} h={230}>
          <DateTile />
        </Pop>

        <Pop at={CUE.bar} x={173} y={325} w={734} h={168}>
          <div style={tileBox()} />
          <div style={{ position: "absolute", left: 22, top: 26 }}>
            <IcClipInspector size={110} />
          </div>
          <div style={{ position: "absolute", right: 18, top: 26 }}>
            <IcFactory size={110} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 128,
              right: 128,
              top: 50,
              textAlign: "center",
              color: IC.white,
              fontSize: Math.min(29, ...T.inspectBar.split("\n").map((l) => fit(l, 29, 478, 0.62))),
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {lines(T.inspectBar)}
          </div>
        </Pop>

        <Pop at={CUE.label} x={540 - LABEL_W / 2} y={550} w={LABEL_W} h={66}>
          <div
            style={{
              ...tileBox(IC.yellow, "rgba(247,208,78,0.25)"),
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: IC.yellowText,
              fontSize: fit(T.stepsLabel, 37, LABEL_W - 50, 0.62),
              fontWeight: 800,
            }}
          >
            {T.stepsLabel}
          </div>
        </Pop>

        {STEP_TEXT.map((_, i) => (
          <Pop key={i} at={CUE.steps[i] ?? CUE.steps[CUE.steps.length - 1]} x={gridPos(i).x} y={gridPos(i).y} w={TILE_W} h={236}>
            <StepTile i={i} w={TILE_W} />
          </Pop>
        ))}

        <Pop at={CUE.okBadge} x={540 - 300} y={okBadgeY} w={600} h={125}>
          <Badge />
        </Pop>

        {t >= CUE.heatTitle && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 1578,
              textAlign: "center",
              color: IC.orangeHi,
              fontSize: 88,
              fontWeight: 900,
              letterSpacing: -2,
              textShadow: glowOrange,
              whiteSpace: "pre",
            }}
          >
            <TypeOn text={T.heatTitle} from={CUE.heatTitle} to={CUE.heatTitle + 0.8} t={t} />
          </div>
        )}
        {subP > 0.001 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 1688,
              textAlign: "center",
              color: IC.orangeHi,
              fontSize: 56,
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: -2,
              textShadow: glowOrange,
              opacity: Math.min(1, subP * 1.5),
              transform: `scale(${0.7 + 0.3 * subP})`,
            }}
          >
            {T.heatSub}
          </div>
        )}
        {CUE.heatTiles.map((at, i) => (
          <Pop key={i} at={at} x={[110, 405, 703][i]} y={1787} w={270} h={274}>
            <HeatTile kind={i as 0 | 1 | 2} />
          </Pop>
        ))}

        <Pop at={CUE.diagram} x={108} y={2105} w={864} h={466}>
          <HeatDiagram t={t} />
        </Pop>
        <Pop at={CUE.noCross} x={270} y={2590} w={540} h={163}>
          <NoCross />
        </Pop>
        <Pop at={CUE.warning} x={108} y={2778} w={864} h={150}>
          <Warning />
        </Pop>
      </div>
    </AbsoluteFill>
  );
};
