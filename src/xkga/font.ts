// Be Vietnam Pro, loaded from the TTF files committed under assets/fonts (SIL OFL 1.1,
// see assets/fonts/OFL.txt) so rendering works fully offline. If a local face fails to
// load, fall back to @remotion/google-fonts (needs network) for that render.
import { continueRender, delayRender } from "remotion";
import { loadFont as loadGoogleFont } from "@remotion/google-fonts/BeVietnamPro";
import regular from "../../assets/fonts/BeVietnamPro-Regular.ttf";
import medium from "../../assets/fonts/BeVietnamPro-Medium.ttf";
import semiBold from "../../assets/fonts/BeVietnamPro-SemiBold.ttf";
import bold from "../../assets/fonts/BeVietnamPro-Bold.ttf";
import extraBold from "../../assets/fonts/BeVietnamPro-ExtraBold.ttf";
import black from "../../assets/fonts/BeVietnamPro-Black.ttf";
import mediumItalic from "../../assets/fonts/BeVietnamPro-MediumItalic.ttf";
import semiBoldItalic from "../../assets/fonts/BeVietnamPro-SemiBoldItalic.ttf";
import boldItalic from "../../assets/fonts/BeVietnamPro-BoldItalic.ttf";
import extraBoldItalic from "../../assets/fonts/BeVietnamPro-ExtraBoldItalic.ttf";
import blackItalic from "../../assets/fonts/BeVietnamPro-BlackItalic.ttf";

const LOCAL_FAMILY = "Be Vietnam Pro Local";

const FACES: { url: string; weight: string; style: "normal" | "italic" }[] = [
  { url: regular, weight: "400", style: "normal" },
  { url: medium, weight: "500", style: "normal" },
  { url: semiBold, weight: "600", style: "normal" },
  { url: bold, weight: "700", style: "normal" },
  { url: extraBold, weight: "800", style: "normal" },
  { url: black, weight: "900", style: "normal" },
  { url: mediumItalic, weight: "500", style: "italic" },
  { url: semiBoldItalic, weight: "600", style: "italic" },
  { url: boldItalic, weight: "700", style: "italic" },
  { url: extraBoldItalic, weight: "800", style: "italic" },
  { url: blackItalic, weight: "900", style: "italic" },
];

let started = false;

const loadGoogleFallback = () => {
  const weights = ["400", "500", "600", "700", "800", "900"] as const;
  loadGoogleFont("normal", { weights: [...weights], subsets: ["latin", "vietnamese"] });
  loadGoogleFont("italic", { weights: weights.slice(1), subsets: ["latin", "vietnamese"] });
};

/** Registers every local face once; blocks rendering until they are ready. */
export const loadLocalFonts = () => {
  if (started || typeof FontFace === "undefined") return;
  started = true;
  const handle = delayRender("Loading local Be Vietnam Pro fonts");
  Promise.all(
    FACES.map(async (f) => {
      const face = new FontFace(LOCAL_FAMILY, `url(${f.url}) format("truetype")`, {
        weight: f.weight,
        style: f.style,
      });
      await face.load();
      document.fonts.add(face);
    }),
  )
    .catch((err) => {
      console.warn("Local fonts failed, falling back to Google Fonts:", err);
      loadGoogleFallback();
    })
    .finally(() => continueRender(handle));
};

loadLocalFonts();

/** CSS font stack: local files first, Google-fonts family as fallback. */
export const FONT = `"${LOCAL_FAMILY}", "Be Vietnam Pro", sans-serif`;
