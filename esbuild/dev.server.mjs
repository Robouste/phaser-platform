import inlineImage from "esbuild-plugin-inline-image";
import esbuildServe from "esbuild-serve";

esbuildServe(
  {
    logLevel: "info",
    entryPoints: ["src/main.ts"],
    bundle: true,
    sourcemap: true,
    outfile: "public/bundle.min.js",
    plugins: [inlineImage()],
  },
  {
    root: "public",
    port: 8080,
  }
);
