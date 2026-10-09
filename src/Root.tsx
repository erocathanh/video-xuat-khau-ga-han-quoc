import { Composition } from "remotion";
import { XkgaMapIntro, MAP_INTRO_FRAMES, XkgaMapMarkets, MAP_MARKETS_FRAMES } from "./xkga/maps";
import { XkgaInfographic, XKGA_INFO_FRAMES } from "./xkga/infographic";
import { XkgaVi, XKGA_VI_FRAMES } from "./xkga/XkgaVi";

// XkgaVi is the full video. The other three are its building-block scenes, kept for previewing.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="XkgaVi" component={XkgaVi} durationInFrames={XKGA_VI_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="XkgaInfographic" component={XkgaInfographic} durationInFrames={XKGA_INFO_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="XkgaMapIntro" component={XkgaMapIntro} durationInFrames={MAP_INTRO_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="XkgaMapMarkets" component={XkgaMapMarkets} durationInFrames={MAP_MARKETS_FRAMES} fps={30} width={1080} height={1920} />
    </>
  );
};
