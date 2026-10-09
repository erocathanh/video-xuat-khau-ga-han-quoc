// Webpack (Remotion bundler) turns font imports into asset URLs.
declare module "*.ttf" {
  const url: string;
  export default url;
}
