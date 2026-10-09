// Shared design kit for the xkga short (vertical news style, 1080x1920, 30 fps).
// Look: dark satellite maps + black infographic panels, orange glow accents,
// Be Vietnam Pro (vietnamese subset). Keep y 1450–1700 free for subtitles.
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring } from "remotion";
import { FONT } from "./font";

export { FONT };

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const SUB_SAFE = { top: 1450, bottom: 1700 } as const;

export const C = {
  bg: "#000000",
  tile: "#121212",
  tileBorder: "#F28C1B",
  orange: "#FF8A1A",
  orangeHot: "#FFB13B",
  orangeDeep: "#E2620A",
  yellow: "#FFD54A",
  neonYellow: "#E9F23A",
  white: "#FFFFFF",
  ink: "#111111",
  muted: "#A8A8A8",
  green: "#2EBF5A",
  red: "#E5322D",
  pinFill: "#FFF1B8",
  pinRing: "#F7B32B",
  pinInk: "#E8323C",
};

// Glow helpers -------------------------------------------------------------
export const textGlow = (color: string = C.orange, r = 18) =>
  `0 0 ${r * 0.4}px ${color}, 0 0 ${r}px ${color}99`;
export const boxGlow = (color: string = C.orange, r = 22) =>
  `0 0 ${r * 0.35}px ${color}, 0 0 ${r}px ${color}88, inset 0 0 ${r * 0.4}px ${color}55`;
export const HEAD_SHADOW = "0 6px 0 rgba(0,0,0,0.35), 0 10px 24px rgba(0,0,0,0.55)";
// SVG filter id for orange outer glow; render <GlowDefs/> once inside each <svg>.
export const GLOW_ID = "xkgaGlow";
export const GlowDefs: React.FC<{ id?: string; blur?: number }> = ({ id = GLOW_ID, blur = 6 }) => (
  <defs>
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="b1" />
      <feGaussianBlur in="SourceGraphic" stdDeviation={blur * 0.35} result="b2" />
      <feMerge>
        <feMergeNode in="b1" />
        <feMergeNode in="b2" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

// Animation helpers --------------------------------------------------------
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = (f: number, a: number, b: number, from = 0, to = 1, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing: e });
export const pop = (f: number, start: number, fps = FPS, damping = 12) =>
  spring({ frame: f - start, fps, config: { damping, stiffness: 160, mass: 0.7 } });
export const sec = (s: number) => Math.round(s * FPS);

// Stacked headline (bold, uppercase, slight shadow) ------------------------
export const Headline: React.FC<{
  lines: { text: string; size: number; color?: string }[];
  top: number;
  appear: number; // 0..1
  rotate?: number;
  align?: "center" | "left";
  lineGap?: number;
}> = ({ lines, top, appear, rotate = 0, align = "center", lineGap = 0.98 }) => (
  <div
    style={{
      position: "absolute",
      left: 40,
      right: 40,
      top,
      textAlign: align,
      fontFamily: FONT,
      fontWeight: 900,
      transform: `rotate(${rotate}deg) scale(${0.85 + 0.15 * appear})`,
      opacity: appear,
    }}
  >
    {lines.map((l, i) => (
      <div
        key={i}
        style={{
          fontSize: l.size,
          lineHeight: lineGap,
          color: l.color ?? C.orange,
          textShadow: HEAD_SHADOW,
          letterSpacing: -0.5,
          whiteSpace: "pre",
        }}
      >
        {l.text}
      </div>
    ))}
  </div>
);

// Neutral placeholder badge (no real brand logo): circle with initials -----
export const InitialsBadge: React.FC<{ text: string; size: number }> = ({ text, size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle at 40% 35%, #FFFBE6, ${C.pinFill})`,
      border: `${Math.max(3, size * 0.06)}px solid ${C.pinRing}`,
      boxShadow: `0 0 ${size * 0.25}px ${C.orange}AA, 0 4px 10px rgba(0,0,0,0.5)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size * 0.42,
      color: C.pinInk,
      letterSpacing: -1,
    }}
  >
    {text}
  </div>
);

export const BlackBg: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>{children}</AbsoluteFill>
);
